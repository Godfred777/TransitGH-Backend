import { Test, TestingModule } from '@nestjs/testing';
import { TrackingGateway } from './tracking.gateway';
import { TrackingService } from './tracking.service';
import { TripService } from 'src/trip/trip.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('TrackingGateway', () => {
  let gateway: TrackingGateway;
  let trackingService: TrackingService;
  let tripService: TripService;
  let prismaService: PrismaService;

  const mockTrackingService = {
    checkArrivalStatus: jest.fn(),
  };

  const mockTripService = {
    getNextStopForTrip: jest.fn(),
  };

  const mockPrismaService = {
    trip: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingGateway],
    }).compile();

    gateway = module.get<TrackingGateway>(TrackingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleJoinRoom', () => {
    it('should allow a user to join a trip room', () => {
      const mockClient = {
        join: jest.fn(),
      };
      const data = { tripId: '123' };
      gateway.handleJoinRoom(data, mockClient as any);
      expect(mockClient.join).toHaveBeenCalledWith('trip_123');
    });

    it('should log the trip room join', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockClient = {
        join: jest.fn(),
      };
      const data = { tripId: '123' };
      gateway.handleJoinRoom(data, mockClient as any);
      expect(consoleSpy).toHaveBeenCalledWith('User joined trip room: 123');
      consoleSpy.mockRestore();
    });
  });

  describe('handleLocationUpdate', () => {
    it('should process location updates and check for arrival status', async () => {
      const data = { tripId: 1, lat: 40.712776, lng: -74.005974 };
      const nextStop = { latitude: 40.712776, longitude: -74.005974 };
      mockTripService.getNextStopForTrip.mockResolvedValue(nextStop);
      mockTrackingService.checkArrivalStatus.mockReturnValue(true);
      await gateway.handleLocationUpdate(data);
      expect(mockTripService.getNextStopForTrip).toHaveBeenCalledWith(1);
      expect(mockTrackingService.checkArrivalStatus).toHaveBeenCalledWith(
        40.712776,
        -74.005974,
        nextStop.latitude,
        nextStop.longitude,
      );
      expect(mockPrismaService.trip.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { currentStopSequence: expect.anything() },
      });
    });
  });

  it('should not update trip if bus has not arrived at the stop', async () => {
    const data = { tripId: 1, lat: 40.712776, lng: -74.005974 };
    const nextStop = { latitude: 40.713776, longitude: -74.005974 };
    mockTripService.getNextStopForTrip.mockResolvedValue(nextStop);
    mockTrackingService.checkArrivalStatus.mockReturnValue(false);
    await gateway.handleLocationUpdate(data);
    expect(mockTripService.getNextStopForTrip).toHaveBeenCalledWith(1);
    expect(mockTrackingService.checkArrivalStatus).toHaveBeenCalledWith(
      40.712776,
      -74.005974,
      nextStop.latitude,
      nextStop.longitude,
    );
    expect(mockPrismaService.trip.update).not.toHaveBeenCalled();
  });

  it('should not update trip if there is no next stop', async () => {
    const data = { tripId: 1, lat: 40.712776, lng: -74.005974 };
    mockTripService.getNextStopForTrip.mockResolvedValue(null);
    await gateway.handleLocationUpdate(data);
    expect(mockTripService.getNextStopForTrip).toHaveBeenCalledWith(1);
    expect(mockTrackingService.checkArrivalStatus).not.toHaveBeenCalled();
    expect(mockPrismaService.trip.update).not.toHaveBeenCalled();
  });
});
