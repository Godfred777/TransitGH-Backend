import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { PrismaService } from '../prisma/prisma.service';
import { TripStatus } from '../../generated/prisma/client';

describe('TripService', () => {
  let service: TripService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        // We can also provide a mock PrismaService here if needed
        {
          provide: PrismaService,
          useValue: {
          trip: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
          },
        },
        }
      ],

    }).compile();

    service = module.get<TripService>(TripService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startTripBroadcast', () => {
    it('should create a new trip with BOARDING status', async () => {
      const mockTrip = {
        id: 1,
        routeId: 1,
        vehicleId: 1,
        driverId: 1,
        startTime: new Date(),
        status: TripStatus.BOARDING,
        route: { id: 1, name: 'Route 1' },
        vehicle: { id: 1, licensePlate: 'ABC123' },
      };
      (prisma.trip.create as jest.Mock).mockResolvedValue(mockTrip);
      const result = await service.startTripBroadcast(1, 1, 1);
      expect(result).toEqual(mockTrip);
      expect(prisma.trip.create).toHaveBeenCalledWith({
        data: {
          routeId: 1,
          vehicleId: 1,
          driverId: 1,
          startTime: expect.any(Date),
          status: TripStatus.BOARDING,
        },
        include: {
          route: true,
          vehicle: true,
        },
      });
    });
  });

  describe('updateTripStatus', () => {
    it('should update the trip status', async () => {
      const mockUpdatedTrip = {
        id: 1,
        status: TripStatus.IN_TRANSIT,
      };
      (prisma.trip.update as jest.Mock).mockResolvedValue(mockUpdatedTrip);
      const result = await service.updateTripStatus(1, TripStatus.IN_TRANSIT);
      expect(result).toEqual(mockUpdatedTrip);
      expect(prisma.trip.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: TripStatus.IN_TRANSIT },
      });
    });
  });

  // Additional tests for getNextStopForTrip can be added here
  describe('getNextStopForTrip', () => {
    it('should return the next stop for a trip in BOARDING status', async () => {
      const mockTrip = {
        id: 1,
        status: TripStatus.BOARDING,
        route: {
          stops: [
            { sequence: 1, stop: { id: 1, name: 'Stop 1' } },
            { sequence: 2, stop: { id: 2, name: 'Stop 2' } },
          ],
        },
      };
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);
      const result = await service.getNextStopForTrip(1);
      expect(result).toEqual({ id: 1, name: 'Stop 1' });
      expect(prisma.trip.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          route: {
            include: {
              stops: {
                orderBy: { sequence: 'asc' },
                include: { stop: true },
              },
            },
          },
        },
      });
    });
  })

  describe('completedTrip', () => {
    it('should return the next stop for a trip in IN_TRANSIT status', async () => {
      const mockTrip = {
        id: 1,
        status: TripStatus.IN_TRANSIT,
        route: {
          stops: [
            { sequence: 1, stop: { id: 1, name: 'Stop 1' } },
            { sequence: 2, stop: { id: 2, name: 'Stop 2' } },
          ],
        },      };
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);
      const result = await service.getNextStopForTrip(1);
      expect(result).toEqual({ id: 1, name: 'Stop 1' });
      expect(prisma.trip.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          route: {
            include: {
              stops: {
                orderBy: { sequence: 'asc' },
                include: { stop: true },
              },
            },
          },
        },
      });
    });

    it('should throw an error if trip is not found', async () => {
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getNextStopForTrip(999)).rejects.toThrow('Trip not found');
    });
  });

  describe('getRouteStopCout', async () => {
    it('should return the count of stops for a given route', async () => {
      const mockCount = 5;
      (prisma.routeStop.count as jest.Mock).mockResolvedValue(mockCount);
      const result = await service.getRouteStopCount(1);
      expect(result).toEqual(mockCount);
      expect(prisma.routeStop.count).toHaveBeenCalledWith({
        where: { routeId: 1 },
      });
    });
  });
});
