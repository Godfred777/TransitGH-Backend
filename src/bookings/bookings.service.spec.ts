import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { FareService } from 'src/fares/fares.service';
import { PaystackService } from '../payment/paystack/paystack.service';
import { BadRequestException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let prismaService: PrismaService;
  let fareService: FareService;
  let paystackService: PaystackService;

  const mockPrismaService = {
    trip: {
      findUnique: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockFareService = {
    calculateFare: jest.fn(),
  };

  const mockPaystackService = {
    initializeTransaction: jest.fn(),
    verifyTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
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

    service = module.get<BookingsService>(BookingsService);
    prismaService = module.get<PrismaService>(PrismaService);
    fareService = module.get<FareService>(FareService);
    paystackService = module.get<PaystackService>(PaystackService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkSeatAvailability', () => {
    const mockTrip = {
      id: 1,
      vehicle: {
        capacity: 15,
      },
    };

    const mockBookings = [
      { seatNumber: 1 },
      { seatNumber: 2 },
      { seatNumber: 3 },
    ];

    it('should return available seats when trip exists', async () => {
      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrismaService.booking.findMany.mockResolvedValue(mockBookings);

      const result = await service.checkSeatAvailability(1, 1, 5);

      expect(result).toHaveLength(12);
      expect(result).not.toContain(1);
      expect(result).not.toContain(2);
      expect(result).not.toContain(3);
      expect(result).toContain(4);
      expect(result).toContain(15);
      expect(prismaService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { vehicle: true },
      });
      expect(prismaService.booking.findMany).toHaveBeenCalledWith({
        where: {
          tripId: 1,
          paymentStatus: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
          AND: [
            { pickupSeq: { lt: 5 } },
            { dropoffSeq: { gt: 1 } },
          ],
        },
        select: { seatNumber: true },
      });
    });

    it('should return all seats when no bookings exist', async () => {
      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrismaService.booking.findMany.mockResolvedValue([]);

      const result = await service.checkSeatAvailability(1, 1, 5);

      expect(result).toHaveLength(15);
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });

    it('should throw error when trip not found', async () => {
      mockPrismaService.trip.findUnique.mockResolvedValue(null);

      await expect(service.checkSeatAvailability(999, 1, 5)).rejects.toThrow(
        'Trip with ID 999 not found',
      );
    });

    it('should handle fully booked trip', async () => {
      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
      
      const fullyBooked = Array.from({ length: 15 }, (_, i) => ({
        seatNumber: i + 1,
      }));
      mockPrismaService.booking.findMany.mockResolvedValue(fullyBooked);

      const result = await service.checkSeatAvailability(1, 1, 5);

      expect(result).toHaveLength(0);
    });
  });

  describe('findAll', () => {
    const mockBookings = [
      { id: 1, userId: 1, tripId: 1, seatNumber: 1 },
      { id: 2, userId: 2, tripId: 1, seatNumber: 2 },
    ];

    it('should return all bookings', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue(mockBookings);

      const result = await service.findAll();

      expect(result).toEqual(mockBookings);
      expect(prismaService.booking.findMany).toHaveBeenCalledWith();
    });

    it('should return empty array when no bookings exist', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAllByUserId', () => {
    const userId = 1;
    const mockUserBookings = [
      { id: 1, userId: 1, tripId: 1, seatNumber: 1 },
      { id: 3, userId: 1, tripId: 2, seatNumber: 5 },
    ];

    it('should return bookings for specific user', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue(mockUserBookings);

      const result = await service.findAllByUserId(userId);

      expect(result).toEqual(mockUserBookings);
      expect(prismaService.booking.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should return empty array when user has no bookings', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([]);

      const result = await service.findAllByUserId(userId);

      expect(result).toEqual([]);
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
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.findOne(bookingId);

      expect(result).toEqual(mockBooking);
      expect(prismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
      });
    });

    it('should return null when booking not found', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('releaseExpiredHolds', () => {
    it('should update expired pending bookings to cancelled', async () => {
      mockPrismaService.booking.updateMany.mockResolvedValue({ count: 3 });

      await service.releaseExpiredHolds();

      expect(prismaService.booking.updateMany).toHaveBeenCalledWith({
        where: {
          paymentStatus: 'PENDING_PAYMENT',
          createdAt: {
            lte: expect.any(Date),
          },
        },
        data: {
          paymentStatus: 'CANCELLED',
        },
      });
    });

    it('should handle no expired bookings', async () => {
      mockPrismaService.booking.updateMany.mockResolvedValue({ count: 0 });

      await service.releaseExpiredHolds();

      expect(prismaService.booking.updateMany).toHaveBeenCalled();
    });
  });
});
