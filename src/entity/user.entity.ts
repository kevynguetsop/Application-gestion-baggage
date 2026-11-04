import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Trips } from "./trips.entity";
import { Booking } from "./booking.entity";

export enum UserRole {
  TRAVELER = 'traveler',
  CUSTOMER = 'customer',
  ADMIN = 'admin'
}

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    unique: true
  })
  email!: string;

  @Column()
  phoneNumber!: number;

  @Column({
    select: false 
  })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER
  })
  role!: UserRole;

  @OneToMany(() => Trips, (trip) => trip.traveler)
  trips!: Trips[];

  @OneToMany(() => Booking, (booking) => booking.client)
  bookings!: Booking[];
}