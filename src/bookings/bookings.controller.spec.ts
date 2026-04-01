import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FareService } from 'src/fares/fares.service';
import { PaystackService } from 'src/payment/paystack/paystack.service';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { CreateBookingDto } from './dto/booking.dto';
import { Role } from 'generated/prisma/client';

describe('BookingsController', () => {
  let controller: BookingsController;
  let bookingsService: BookingsService;
  let prismaService: PrismaService;
  let fareService: FareService;
  let paystackService: PaystackService;

  const mockBookingsService = {
    findAll: jest.fn(),
    findAllByUserId: jest.fn(),
    findOne: jest.fn(),
    checkSeatAvailability: jest.fn(),
  };

  const mockPrismaService = {
    booking: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockFareService = {
    calculateFare: jest.fn(),
  };

  const mockPaystackService = {
    initializeTransaction: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: Role.PASSENGER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FareService,
          useValue: mockFareService,
        },
        {
          provide: PaystackService,
          useValue: mockPaystackService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    bookingsService = module.get<BookingsService>(BookingsService);
    prismaService = module.get<PrismaService>(PrismaService);
    fareService = module.get<FareService>(FareService);
    paystackService = module.get<PaystackService>(PaystackService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const mockBookings = [
      { id: 1, userId: 1, tripId: 1, seatNumber: 1 },
      { id: 2, userId: 2, tripId: 1, seatNumber: 2 },
    ];

    it('should return all bookings', async () => {
      mockBookingsService.findAll.mockResolvedValue(mockBookings);

      const result = await controller.findAll();

      expect(result).toEqual(mockBookings);
      expect(bookingsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findAllByUserId', () => {
    const userId = 1;
    const mockUserBookings = [
      { id: 1, userId: 1, tripId: 1, seatNumber: 1 },
      { id: 3, userId: 1, tripId: 2, seatNumber: 5 },
    ];

    it('should return bookings for specific user', async () => {
      mockBookingsService.findAllByUserId.mockResolvedValue(mockUserBookings);

      const result = await controller.findAllByUserId(userId);

      expect(result).toEqual(mockUserBookings);
      expect(bookingsService.findAllByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    const bookingId = 1;
    const mockBooking = {
      id: bookingId,
      userId: 1,
      tripId: 1,
      seatNumber: 1,
      paymentStatus: 'CONFIRMED',
    };

    it('should return a single booking by id', async () => {
      mockBookingsService.findOne.mockResolvedValue(mockBooking);

      const result = await controller.findOne(bookingId);

      expect(result).toEqual(mockBooking);
      expect(bookingsService.findOne).toHaveBeenCalledWith(bookingId);
    });
  });

  describe('initiateBooking', () => {
    const createBookingDto: CreateBookingDto = {
      tripId: 1,
      seatNumber: 5,
      pickupSeq: 1,
      dropoffSeq: 5,
      pickupStopId: 1,
      dropoffStopId: 5,
      routeId: 1,
    };

    const mockAvailableSeats = [5, 6, 7, 8];
    const mockFare = 25.50;
    const mockBooking = {
      id: 1,
      userId: mockUser.id,
      ...createBookingDto,
      paymentStatus: 'PENDING_PAYMENT',
      ticketCode: 'TK123456',
      createdAt: new Date(),
    };
    const mockPaymentResponse = {
      authorization_url: 'https://paystack.com/pay/xyz123',
      access_code: 'xyz123',
      reference: 'ref123',
    };

    it('should successfully initiate a booking', async () => {
      mockBookingsService.checkSeatAvailability.mockResolvedValue(mockAvailableSeats);
      mockFareService.calculateFare.mockResolvedValue(mockFare);
      mockPrismaService.booking.create.mockResolvedValue(mockBooking);
      mockPaystackService.initializeTransaction.mockResolvedValue(mockPaymentResponse);
      mockPrismaService.booking.update.mockResolvedValue({
        ...mockBooking,
        paymentReference: mockPaymentResponse.reference,
      });

      const result = await controller.initiateBooking(createBookingDto, mockUser as any);

      expect(result).toEqual({
        checkoutUrl: mockPaymentResponse.authorization_url,
        bookingId: mockBooking.id,
      });

      expect(bookingsService.checkSeatAvailability).toHaveBeenCalledWith(
        createBookingDto.tripId,
        createBookingDto.pickupSeq,
        createBookingDto.dropoffSeq,
      );

      expect(fareService.calculateFare).toHaveBeenCalledWith(
        createBookingDto.routeId,
        createBookingDto.pickupStopId,
        createBookingDto.dropoffStopId,
      );

      expect(prismaService.booking.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          tripId: createBookingDto.tripId,
          seatNumber: createBookingDto.seatNumber,
          pickupStopId: createBookingDto.pickupStopId,
          dropoffStopId: createBookingDto.dropoffStopId,
          pickupSeq: createBookingDto.pickupSeq,
          dropoffSeq: createBookingDto.dropoffSeq,
          price: mockFare,
          paymentStatus: 'PENDING_PAYMENT',
          ticketCode: expect.any(String),
        },
      });

      expect(paystackService.initializeTransaction).toHaveBeenCalledWith(
        mockUser.email,
        mockFare,
        mockBooking.id,
      );

      expect(prismaService.booking.update).toHaveBeenCalledWith({
        where: { id: mockBooking.id },
        data: { paymentReference: mockPaymentResponse.reference },
      });
    });

    it('should throw BadRequestException when seat is not available', async () => {
      const occupiedSeats = [1, 2, 3, 4];
      mockBookingsService.checkSeatAvailability.mockResolvedValue(occupiedSeats);

      await expect(
        controller.initiateBooking(createBookingDto, mockUser as any),
      ).rejects.toThrow(BadRequestException);

      await expect(
        controller.initiateBooking(createBookingDto, mockUser as any),
      ).rejects.toThrow('Seat already taken');

      expect(bookingsService.checkSeatAvailability).toHaveBeenCalled();
      expect(prismaService.booking.create).not.toHaveBeenCalled();
      expect(paystackService.initializeTransaction).not.toHaveBeenCalled();
    });

    it('should handle booking creation failure', async () => {
      mockBookingsService.checkSeatAvailability.mockResolvedValue(mockAvailableSeats);
      mockFareService.calculateFare.mockResolvedValue(mockFare);
      mockPrismaService.booking.create.mockRejectedValue(new Error('Database error'));

      await expect(
        controller.initiateBooking(createBookingDto, mockUser as any),
      ).rejects.toThrow();

      expect(prismaService.booking.create).toHaveBeenCalled();
      expect(paystackService.initializeTransaction).not.toHaveBeenCalled();
    });

    it('should handle payment initialization failure', async () => {
      mockBookingsService.checkSeatAvailability.mockResolvedValue(mockAvailableSeats);
      mockFareService.calculateFare.mockResolvedValue(mockFare);
      mockPrismaService.booking.create.mockResolvedValue(mockBooking);
      mockPaystackService.initializeTransaction.mockRejectedValue(
        new Error('Payment service error'),
      );

      await expect(
        controller.initiateBooking(createBookingDto, mockUser as any),
      ).rejects.toThrow();

      expect(prismaService.booking.create).toHaveBeenCalled();
      expect(paystackService.initializeTransaction).toHaveBeenCalled();
    });

    it('should use guest email when user email is not available', async () => {
      const userWithoutEmail = { id: 2, role: Role.PASSENGER };
      mockBookingsService.checkSeatAvailability.mockResolvedValue(mockAvailableSeats);
      mockFareService.calculateFare.mockResolvedValue(mockFare);
      mockPrismaService.booking.create.mockResolvedValue(mockBooking);
      mockPaystackService.initializeTransaction.mockResolvedValue(mockPaymentResponse);
      mockPrismaService.booking.update.mockResolvedValue({
        ...mockBooking,
        paymentReference: mockPaymentResponse.reference,
      });

      await controller.initiateBooking(createBookingDto, userWithoutEmail as any);

      expect(paystackService.initializeTransaction).toHaveBeenCalledWith(
        'guest@transitgh.com',
        mockFare,
        mockBooking.id,
      );
    });
  });
});
