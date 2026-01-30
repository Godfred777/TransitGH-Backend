import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PaystackService } from 'src/payment/paystack/paystack.service';
import { FareService } from 'src/fares/fares.service';
import { HttpModule } from '@nestjs/axios';


@Module({
  providers: [BookingsService, PrismaService, ScheduleModule, PaystackService, FareService],
  controllers: [BookingsController],
  imports: [HttpModule],
})
export class BookingsModule {}
