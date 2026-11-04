import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trips } from 'src/entity/trips.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trips])
  ],
  providers: [TripsService],
  controllers: [TripsController]
})
export class TripsModule {}
