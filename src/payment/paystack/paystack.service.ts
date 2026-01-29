import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaystackService {
  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  async initializeTransaction(email: string, amountGHS: number, bookingId: number) {
    const secretKey = this.config.get('PAYSTACK_SECRET_KEY');
    
    // Paystack expects amount in Kobo (multiply by 100)
    const amountKobo = Math.round(amountGHS * 100);

    const params = {
      email,
      amount: amountKobo,
      metadata: { bookingId }, // Pass ID so we know what to confirm later
      callback_url: 'https://your-frontend-app.com/booking/status', // Where user goes after paying
      channels: ['mobile_money', 'card'],
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post('https://api.paystack.co/transaction/initialize', params, {
          headers: { Authorization: `Bearer ${secretKey}` },
        }),
      );
      return response.data.data; // Contains { authorization_url, access_code, reference }
    } catch (error) {
      throw new HttpException('Payment Initialization Failed', 500);
    }
  }

  async verifyTransaction(reference: string) {
    const secretKey = this.config.get('PAYSTACK_SECRET_KEY');
    
    try {
      const response = await lastValueFrom(
        this.httpService.get(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: { Authorization: `Bearer ${secretKey}` },
        }),
      );
      return response.data.data; // Contains status: "success"
    } catch (error) {
      return null;
    }
  }
}