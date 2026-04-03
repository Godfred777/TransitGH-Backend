import { Test, TestingModule } from '@nestjs/testing';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { PrismaService } from '../prisma/prisma.service';
import { TripStatus } from '../../generated/prisma/client';


describe('TripController', () => {
  let controller: TripController;
  let tripService: TripService;
  let prismaService: PrismaService;
  let tripStatus: TripStatus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripController],
    }).compile();

    controller = module.get<TripController>(TripController);
    tripService = module.get<TripService>(TripService);
    prismaService = module.get<PrismaService>(PrismaService);
    tripStatus = TripStatus.BOARDING; // Default status for testing
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('start', () => {
    it('should start a trip and return the trip details', async () => {
      const body = { routeId: 1, vehicleId: 1, driverId: 1 };
      const result = await controller.startTrip(body);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('routeId', body.routeId);
      expect(result).toHaveProperty('vehicleId', body.vehicleId);
      expect(result).toHaveProperty('driverId', body.driverId);
      expect(result).toHaveProperty('status', 'BOARDING');
    });
  });

  describe('updateStatus', () => {
    it('should update the trip status', async () => {
      const tripId = 1;
      const status = TripStatus.IN_TRANSIT;
      const result = await controller.updateStatus(tripId.toString(), status);
      expect(result).toHaveProperty('id', tripId);
      expect(result).toHaveProperty('status', status);
    });
  });

  describe('getActiveTrips', () => {
    it('should return a list of active trips', async () => {
      const result = await controller.getActiveTrips();
      expect(Array.isArray(result)).toBe(true);
      result.forEach(trip => {
        expect(trip).toHaveProperty('status');
        expect(['BOARDING', 'IN_TRANSIT']).toContain(trip.status);
      });
    });
  });
});
