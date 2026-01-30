import { Module } from '@nestjs/common';
import { PaystackService } from './paystack/paystack.service';
import { FaresController } from './fares/fares.controller';
import { PaymentController } from './payment/payment.controller';
import { PaymentController } from './payment.controller';

@Module({
  providers: [PaystackService],
  controllers: [FaresController, PaymentController]
})
export class PaymentModule {}
