import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingService],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkArrivalStatus', () => {
    it('should return true if bus is within 50 meters of the stop', () => {
      const busLat = 40.712776;
      const busLong = -74.005974;
      const stopLat = 40.712776; // Same location
      const stopLong = -74.005974;
      expect(service.checkArrivalStatus(busLat, busLong, stopLat, stopLong)).toBe(true);
    });

    it('should return false if bus is more than 50 meters away from the stop', () => {
      const busLat = 40.712776;
      const busLong = -74.005974;
      const stopLat = 40.713776; // Approximately 111 meters north
      const stopLong = -74.005974;
      expect(service.checkArrivalStatus(busLat, busLong, stopLat, stopLong)).toBe(false);
    });

    it('should return true if bus is exactly 50 meters away from the stop', () => {
      const busLat = 40.712776;
      const busLong = -74.005974;
      const stopLat = 40.713226;
      const stopLong = -74.005974;
      expect(service.checkArrivalStatus(busLat, busLong, stopLat, stopLong)).toBe(true);
    });
  });

  describe('sortStopsByDistance', () => {
    it('should sort stops by distance from the user', () => {
      const userLat = 40.712776;
      const userLong = -74.005974;
      const routeStops = [
        { id: 1, latitude: 40.713776, longitude: -74.005974 }, // ~111m north
        { id: 2, latitude: 40.712776, longitude: -74.006974 }, // ~85m west
        { id: 3, latitude: 40.712776, longitude: -74.004974 }, // ~85m east
      ];
      const sortedStops = service.sortStopsByDistance(userLat, userLong, routeStops);
      expect(sortedStops[0].id).toBe(2);
      expect(sortedStops[1].id).toBe(3);
      expect(sortedStops[2].id).toBe(1);
    });
  })

  describe('getRouteSegment', () => {
    it('should return the correct route segment between two points', () => {
      const startLat = 40.712776;
      const startLong = -74.005974;
      const endLat = 40.713776;
      const endLong = -74.005974;
      const fullRouteLine = {
        type: 'LineString',
        coordinates: [
          [-74.005974, 40.712776],
          [-74.005974, 40.713776],
          [-74.005974, 40.714776],
        ],
      };
      const segment = service.getRouteSegment(startLat, startLong, endLat, endLong, fullRouteLine);
      expect(segment).toEqual({
        type: 'LineString',
        coordinates: [
          [-74.005974, 40.712776],
          [-74.005974, 40.713776],
        ],
      });
    });
  });
});
