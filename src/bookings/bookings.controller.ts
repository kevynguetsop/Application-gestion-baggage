import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateBookingDto } from 'src/trips/dto/create-booking.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/entity/user.entity';

@Controller('bookings')
export class BookingsController {
    constructor(
        private readonly bookingsService: BookingsService
    ){}
    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @Body() dto: CreateBookingDto,
        @CurrentUser() 
        user: User
    ){
        return this.bookingsService.create(dto, user)
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-bookings')
    findMyBooking(
        @CurrentUser()
        user: User
    ){
        return this.bookingsService.findMyBookings(user)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/accept')
    acceptBooking(
        //recuperer l'id de la reservation
        @Param('id',ParseIntPipe)
        id: number,
        //recuperer le voyageur connecte 
        @CurrentUser()
        user: User
    ){
        return this.bookingsService.acceptBooking(id, user)
    }
    @UseGuards(JwtAuthGuard)
@Patch(':id/reject')
rejectBooking(
  @Param('id', ParseIntPipe) id: number,
  @CurrentUser() user: User,
) {
  return this.bookingsService.rejectBooking(id, user);
}
@UseGuards(JwtAuthGuard)
@Patch(':id/pay')
payBooking(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser()
    user: User 
){
    return this.bookingsService.PayBooking(id, user)
}
@UseGuards(JwtAuthGuard)
@Patch(':id/cancel')
cancelBooking(
  @Param('id', ParseIntPipe) id: number,
  @CurrentUser() user: User,
) {
  // Appeler le service pour annuler la réservation
  return this.bookingsService.cancelBooking(id, user);
}
}
