import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guards';
import { RolesGuard, Roles } from 'src/auth/roles.guard';
import { Role } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/booking.dto';
import { nanoid } from 'nanoid';
import { BadRequestException } from '@nestjs/common';
import { CurrentUser } from 'src/users/decorators/users.decorators';
import { type User } from 'generated/prisma/client';
import { FareService } from 'src/fares/fares.service';
import { PaystackService } from 'src/payment/paystack/paystack.service';


@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly bookingService: BookingsService,
    private readonly fareService: FareService,
    private readonly prisma: PrismaService,
    private readonly paystackService: PaystackService,
    ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get('bookings/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PASSENGER)
  async findAllByUserId(@Param('userId') userId: number) {
    return this.bookingsService.findAllByUserId(userId);
  }

  @Get('booking/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PASSENGER)
  async findOne(@Param('id') id: number) {
    return this.bookingsService.findOne(id);
  }

  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PASSENGER)
  async initiateBooking(
    @Body() body: CreateBookingDto, @CurrentUser() user: User) {
    // 1. Check Availability (The Overlap Logic)
    const isAvailable = await this.bookingsService.checkSeatAvailability(
      body.tripId,
      body.pickupSeq,
      body.dropoffSeq,
    );
    if (!isAvailable.includes(body.seatNumber)) {
      throw new BadRequestException('Seat already taken');
    }

    // 2. Calculate Price
    const price = await this.fareService.calculateFare(
      body.routeId,
      body.pickupStopId,
      body.dropoffStopId,
    );

    // 3. Create "PENDING" Booking in DB
    // We save the price here to lock it in
    const booking = await this.prisma.booking.create({
      data: {
        userId: user.id,
        tripId: body.tripId,
        seatNumber: body.seatNumber,
        pickupStopId: body.pickupStopId,
        dropoffStopId: body.dropoffStopId,
        pickupSeq: body.pickupSeq,
        dropoffSeq: body.dropoffSeq,
        price: price,
        paymentStatus: 'PENDING_PAYMENT',
        ticketCode: nanoid(8).toUpperCase(), // e.g. "TK-8X92"
      },
    });

    // 4. Call Paystack
    const paymentResponse = await this.paystackService.initializeTransaction(
      (user as any).email || 'guest@transitgh.com', // Fallback if phone-only auth
      price,
      booking.id,
    );

    // 5. Update Booking with Reference
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: { paymentReference: paymentResponse.reference },
    });

    // 6. Return the Checkout URL to Frontend
    return {
      checkoutUrl: paymentResponse.authorization_url,
      bookingId: booking.id,
    };
  }
}
