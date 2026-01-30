import { Module } from '@nestjs/common';
import { PaystackService } from './paystack/paystack.service';
import { FareController } from '../fares/fares.controller';
import { FareService } from '../fares/fares.service';
import { PaymentWebhookController } from './payment.controller';
import { HttpModule} from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';


@Module({
  imports: [HttpModule],
  providers: [PaystackService, FareService, PrismaService, ConfigService],
  controllers: [FareController, PaymentWebhookController],
})
export class PaymentModule {}
