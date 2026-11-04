import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Booking } from './booking.entity';

@Entity()
export class Trips {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  departureCountry!: string;

  @Column()
  destinationCountry!: string;

  @Column()
  departureDate!: Date;

  @Column()
  departureTime!: string;

  @Column()
  availableKg!: number;

  @Column()
  pricePerKg!: number;

  @ManyToOne(() => User, (user) => user.trips)
  traveler!: User;

  @OneToMany(() => Booking, (booking) => booking.trip)
  bookings!: Booking[];
}