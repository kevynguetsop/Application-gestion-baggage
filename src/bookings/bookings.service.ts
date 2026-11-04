import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from 'src/entity/booking.entity';
import { Trips } from 'src/entity/trips.entity';
import { User, UserRole } from 'src/entity/user.entity';
import { CreateBookingDto } from 'src/trips/dto/create-booking.dto';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class BookingsService {
constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(Trips)
    private readonly tripsRepository: Repository<Trips>,

    private readonly dataSource: DataSource
){}
 
 async create(
    dto: CreateBookingDto,
    user: User
 ){
    //verifier que le voyage existe 
    if(user.role !== UserRole.CUSTOMER){
        throw new ForbiddenException(
            'only customers can book trips'
        )
    }
    const trip = await this.tripsRepository.findOne({
     where: {
        id: dto.tripId,
     },
     relations: {
        traveler: true,
     }
    })
    if(!trip){
        throw new NotFoundException('Trip not found')
    }
    //empecher le voyageur de reserver son propre voyage 
     if(trip.traveler.id === user.id){
        throw new BadRequestException(
            'You cannot book your own trip'
        )
     }
     // verifier les kilos disponibles
     if (dto.packageWeight> trip.availableKg){
        throw new BadRequestException(
            'Not enough available kilograms'
        )
     }
     //calculer automatiquement le prix 
     const totalPrice = dto.packageWeight * trip.pricePerKg
     //creer une reservation
     const booking = this.bookingRepository.create({
        packageWeight: dto.packageWeight,
        packageDescription: dto.packageDescription,
        totalPrice,
        client: user,
        trip: trip,
status: BookingStatus.PENDING,
clientPaid: false

     })
     //sauvegarder 
     const savedBooking = await this.bookingRepository.save(booking)

     return{
        message: 'Booking created successfully ',
        booking: savedBooking
     }
 }
//recuperer toutes les reservations d'un client
  async findMyBookings(user: User){
//verifier que l'utilisateur est bien un client 
if(user.role !== UserRole.CUSTOMER){
   throw new ForbiddenException('Only constumers can view thier bookings')
}
//rechercher toutes ls reservations dont le client est l'utilisateur connecte
const bookings = await this.bookingRepository.find({
  // recuperer les informations du voyage ainsi que du voyageur 
   relations: {
      trip:{
         traveler: true
      }
   },
   //ne recuperer que les informations du client
   where: {
      client: {
         id: user.id
      }
   },
   //trier la reservation de la plus recente a la plus ancienne 
   order: {
      id:'DESC'}
})
return bookings
  }

async acceptBooking(
  bookingId: number,
  user: User,
) {

  // Vérifier que seul un voyageur
  // peut accepter une réservation
  if (user.role !== UserRole.TRAVELER) {
    throw new ForbiddenException(
      'Only travelers can accept bookings',
    );
  }

  // Démarrer une transaction TypeORM.
  //
  // Toutes les opérations effectuées avec le
  // transactionManager seront considérées comme
  // faisant partie de la même transaction.
  return await this.dataSource.transaction(
    async (transactionManager) => {

      // Rechercher la réservation avec son voyage
      // et le voyageur propriétaire du voyage.
      //
      // IMPORTANT :
      // On utilise transactionManager.getRepository()
      // et non directement bookingRepository.
      const booking =
        await transactionManager
          .getRepository(Booking)
          .findOne({
            relations: {
              trip: {
                traveler: true,
              },
            },
            where: {
              id: bookingId,
            },
          });

      // Vérifier que la réservation existe
      if (!booking) {
        throw new NotFoundException(
          'Booking not found',
        );
      }

      // Vérifier que le voyage appartient
      // bien au voyageur connecté
      if (
        booking.trip.traveler.id !== user.id
      ) {
        throw new ForbiddenException(
          'This booking does not belong to your trip',
        );
      }

      // Vérifier que la réservation est
      // toujours en attente
      if (
        booking.status !== BookingStatus.PENDING
      ) {
        throw new BadRequestException(
          'This booking has already been processed',
        );
      }

      // Vérifier qu'il reste suffisamment
      // de kilos disponibles
      if (
        booking.packageWeight >
        booking.trip.availableKg
      ) {
        throw new BadRequestException(
          'Not enough available weight',
        );
      }

      // Accepter la réservation
      booking.status =
        BookingStatus.ACCEPTED;

      // Retirer le poids du colis
      // du poids disponible du voyage
      booking.trip.availableKg -=
        booking.packageWeight;

      // Sauvegarder le voyage dans la transaction
      await transactionManager
        .getRepository(Trips)
        .save(booking.trip);

      // Sauvegarder le booking dans la transaction
      await transactionManager
        .getRepository(Booking)
        .save(booking);

      // Si nous arrivons ici sans erreur,
      // TypeORM valide automatiquement la transaction.
      return {
        message:
          'Booking accepted successfully',

        booking,
      };
    },
  );
}
  async rejectBooking(
   bookingId: number,
   user : User 
  ){
   //verifier que seul le voyageur peut refuser une reservation
   if(user.role !== UserRole.TRAVELER){
      throw new ForbiddenException('Only travelers can reject bookings')

   }
   //rechercher la reservation avec le voyage ainsi que le proprietaire du voyage 
   const booking = await this.bookingRepository.findOne({
      relations: {
         trip: {
            traveler: true 
         }
      },
      where: {
         id: bookingId
      }
   })
   //verifier que la reservation existe
   if(!booking){
      throw new NotFoundException('Booking not Found')
   }
   //verifier que le voyage appartient bien au voyageur connecte
   if(
      booking.trip.traveler.id !== user.id
   ){
      throw new ForbiddenException('This booking does not belong to your trip')
   }
   // verifier que la reservation est en attente 
   //une reservation deja acceptee ou refusee ne peut pas etre modifiee 
   if(
   booking.status !== BookingStatus.PENDING
   ){
      throw new BadRequestException('This booking has already been processed')
   } 
   //changer le statut de la reservation 
   booking.status = BookingStatus.REJECTED

   await this.bookingRepository.save(booking)
   return {
      message: 'Booking rejected succesfully', 
      booking
   }
  }

  async PayBooking(
   bookingId: number,
   user: User 
  ){
   // verifier que seul le client peut payer une reservation 
   if(user.role !== UserRole.CUSTOMER){
      throw new ForbiddenException('Only customers can pay for bookings ')
   }
   // rechercher le booking avec son client et son voyage
   const booking = await this.bookingRepository.findOne({
      where: {
         id: bookingId,
      },
      relations: {
         client: true,
         trip: true
      }
   })  
   //Verifier que le booking existe 
   if(!booking){
      throw new NotFoundException('Booking not found ')
   } 
   //verifier que le booking appartient bien au client connecte
   if(booking.client.id !== user.id){
      throw new ForbiddenException(
         'you can only pay for your own bookings '
      )
   }
   //verifier que le booking a ete accepte par le voyageur avant de permettre le payement 
 if(booking.status !== BookingStatus.ACCEPTED){
   throw new BadRequestException('Only accepted bookings can be paid')
 }
 //Verifier que le booking n'a pas deja ete paye 
 if(booking.clientPaid){
   throw new BadRequestException(
      'This booking has already been paid '
   )
 }
 //marquer le booking comme paye 
 booking.clientPaid= true
 const updateBooking = await this.bookingRepository.save(booking)

 return {
   message: 'Booking paid successfully',
   booking: updateBooking
 }
  }
  async cancelBooking(
  bookingId: number,
  user: User
) {
  // Seul un client peut annuler une réservation
  if (user.role !== UserRole.CUSTOMER) {
    throw new ForbiddenException(
      'Only customers can cancel Booking'
    );
  }

  // Démarrer une transaction
  // Si une opération échoue, toutes les modifications
  // effectuées dans cette transaction seront annulées
  return await this.dataSource.transaction(
    async (transactionManager) => {

      // Rechercher la réservation avec son client et son voyage
      const booking = await transactionManager
        .getRepository(Booking)
        .findOne({
          where: {
            id: bookingId,
          },
          relations: {
            client: true,
            trip: true,
          },
        });

      // Vérifier que la réservation existe
      if (!booking) {
        throw new NotFoundException(
          'Booking not found'
        );
      }

      // Vérifier que la réservation appartient
      // au client actuellement connecté
      if (booking.client.id !== user.id) {
        throw new ForbiddenException(
          'You can only cancel your own bookings'
        );
      }

      // Une réservation déjà annulée ne peut pas
      // être annulée une deuxième fois
      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException(
          'This booking has already been cancelled'
        );
      }

      // Une réservation rejetée ne peut pas être annulée
      // puisqu'elle n'a jamais été acceptée
      if (booking.status === BookingStatus.REJECTED) {
        throw new BadRequestException(
          'A rejected booking cannot be cancelled'
        );
      }

      // Si la réservation avait été acceptée,
      // les kilos avaient déjà été retirés du voyage.
      // Nous devons donc les remettre disponibles.
      if (booking.status === BookingStatus.ACCEPTED) {

        booking.trip.availableKg += booking.packageWeight;

        // Sauvegarder le voyage avec les kilos restaurés
        await transactionManager
          .getRepository(Trips)
          .save(booking.trip);
      }

      // Changer le statut de la réservation
      // vers CANCELLED
      booking.status = BookingStatus.CANCELLED;

      // Sauvegarder la réservation
      await transactionManager
        .getRepository(Booking)
        .save(booking);

      // Retourner une réponse claire
      return {
        message: 'Booking cancelled successfully',
        booking,
      };
    }
  );
}
}
