import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/entity/booking.entity';
import { Trips } from 'src/entity/trips.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Booking, Trips])
  ],
  providers: [BookingsService],
  controllers: [BookingsController]
})
export class BookingsModule {}
