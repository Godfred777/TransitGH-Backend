import { Module } from '@nestjs/common';
import { PaystackService } from './paystack/paystack.service';
import { FaresController } from './fares/fares.controller';

@Module({
  providers: [PaystackService],
  controllers: [FaresController]
})
export class PaymentModule {}
