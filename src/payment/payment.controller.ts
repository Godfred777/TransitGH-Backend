import { Controller, Post, Headers, Body, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';


@Controller('webhooks/paystack')
export class PaymentWebhookController {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  @Post()
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() event: any,
  ) {
    // 1. Security: Verify the Event comes from Paystack
    const secret = this.config.get('PAYSTACK_SECRET_KEY');
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(event)).digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid Signature');
    }

    // 2. Handle Success Event
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      
      // 3. Confirm the Booking
      await this.prisma.booking.update({
        where: { paymentReference: reference },
        data: { paymentStatus: 'PAID' }, // Seat is now officially Sarah's
      });
      
      console.log(`Booking confirmed for Ref: ${reference}`);
    }

    return { status: 'received' };
  }
}