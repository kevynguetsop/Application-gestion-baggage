import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TripsModule } from './trips/trips.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({

  imports: [
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username:'root',
  password: '',
  database: 'baggages_db',
  synchronize: true,
  autoLoadEntities: true
}),
UsersModule,
AuthModule,
TripsModule,
BookingsModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
