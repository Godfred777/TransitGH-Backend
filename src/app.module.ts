import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {ConfigModule} from "@nestjs/config";
import { BookingsModule } from './bookings/bookings.module';
import { TransitModule } from './transit/transit.module';
import { StopsModule } from './stops/stops.module';
import { TrackingModule } from './tracking/tracking.module';
import { TripModule } from './trip/trip.module';

@Module({
  imports: [UsersModule, AuthModule, ConfigModule.forRoot({
    isGlobal: true,
  }), BookingsModule, TransitModule, StopsModule, TrackingModule, TripModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
