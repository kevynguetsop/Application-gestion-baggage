import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "./user.entity";
import { Trips } from "./trips.entity";
export enum BookingStatus{
  PENDING= 'pending',
  ACCEPTED= 'accepted',
  REJECTED= 'rejected',
CANCELLED= 'cancelled'
}
@Entity()
export class Booking {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  packageWeight!: number;

  @Column()
  packageDescription!: string;

  // État actuel de la réservation
@Column({
  type: 'enum',
  enum: BookingStatus,
  default: BookingStatus.PENDING,
})
status!: BookingStatus;


  @Column({
    default: false,
  })
  clientPaid!: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  totalPrice!: number 

  @ManyToOne(() => User, (user) => user.bookings)
  client!: User;

  @ManyToOne(() => Trips, (trip) => trip.bookings)
  trip!: Trips;
}

