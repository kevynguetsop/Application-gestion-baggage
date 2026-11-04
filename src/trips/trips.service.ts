import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Trips } from 'src/entity/trips.entity';
import { User, UserRole } from 'src/entity/user.entity';

import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { SearchTripDto } from './dto/search-trip.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { BookingStatus } from 'src/entity/booking.entity';

@Injectable()
export class TripsService {

  constructor(
    @InjectRepository(Trips)
    private readonly tripsRepository: Repository<Trips>,
  ) {}

async create(
  dto: CreateTripDto,
  user: User,
) {

  // Vérifie que seul un voyageur peut créer un voyage
  if (user.role !== UserRole.TRAVELER) {
    throw new ForbiddenException(
      'Only travelers can create trips',
    );
  }

  // -------------------------------------------------------
  // Vérification de la date et de l'heure du départ
  // -------------------------------------------------------

  // On transforme la date reçue en objet Date
  const departureDate = new Date(dto.departureDate);

  // On récupère l'heure et les minutes
  const [hours, minutes] = dto.departureTime
    .split(':')
    .map(Number);

  // On ajoute l'heure et les minutes à la date
  departureDate.setHours(hours, minutes, 0, 0);

  // Date et heure actuelles
  const now = new Date();

  // Le départ doit obligatoirement être dans le futur
  if (departureDate <= now) {
    throw new BadRequestException(
      'The departure date and time must be in the future',
    );
  }

  // -------------------------------------------------------
  // Création du voyage
  // -------------------------------------------------------

  const trip = this.tripsRepository.create({
    ...dto,
    traveler: user,
  });

  return await this.tripsRepository.save(trip);
}
  async findAll(
    pagination: PaginationQueryDto,
  ) {

    const { page, limit } = pagination;

    const [data, total] =
      await this.tripsRepository.findAndCount({

        relations: {
          traveler: true,
        },

        skip: (page - 1) * limit,

        take: limit,

        order: {
          departureDate: 'ASC',
        },
      });

    return {
      total,
      page,
      limit,
      data,
    };
  }

  async findOne(id: number) {

    const trip =
      await this.tripsRepository.findOne({

        where: { id },

        relations: {
          traveler: true,
        },
      });

    if (!trip) {
      throw new NotFoundException(
        'Trip not found',
      );
    }

    return trip;
  }

  async search(
    dto: SearchTripDto,
  ) {

    const query =
      this.tripsRepository.createQueryBuilder(
        'trip',
      );

    query.leftJoinAndSelect(
      'trip.traveler',
      'traveler',
    );

    if (dto.destination) {

      query.andWhere(
  'trip.destinationCountry LIKE :destination',
  {
    destination: `%${dto.destination}%`,
  },
);
    }

    if (dto.departureDate) {

      query.andWhere(
        'trip.departureDate = :date',
        {
          date: dto.departureDate,
        },
      );
    }

    return await query.getMany();
  }

async update(
  id: number,
  dto: UpdateTripDto,
  user: User,
) {

  // Recherche le voyage
  const trip = await this.tripsRepository.findOne({
    where: { id },

    relations: {
      traveler: true,
      bookings: true,
    },
  });

  // Si le voyage n'existe pas
  if (!trip) {
    throw new NotFoundException(
      'Trip not found',
    );
  }

  // Vérifie que le voyage appartient bien
  // au voyageur connecté
  if (trip.traveler.id !== user.id) {
    throw new ForbiddenException(
      'You cannot update this trip',
    );
  }

  // Recherche une réservation acceptée
  const hasAcceptedBooking =
    trip.bookings.some(
      (booking) =>
        booking.status === BookingStatus.ACCEPTED,
    );

  // Si une réservation est déjà acceptée,
  // le voyage ne peut plus être modifié
  if (hasAcceptedBooking) {
    throw new BadRequestException(
      'This trip cannot be modified because it has an accepted booking',
    );
  }

  // Si aucune réservation acceptée n'existe,
  // la modification est autorisée
  Object.assign(trip, dto);

  return await this.tripsRepository.save(
    trip,
  );
}

  async remove(
    id: number,
    user: User,
  ) {

    const trip =
      await this.findOne(id);

    if (trip.traveler.id !== user.id) {

      throw new ForbiddenException(
        'You cannot delete this trip',
      );
    }

    await this.tripsRepository.remove(
      trip,
    );

    return {
      message:
        'Trip deleted successfully',
    };
  }
}