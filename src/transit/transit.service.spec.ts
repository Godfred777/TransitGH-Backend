import { Test, TestingModule } from '@nestjs/testing';
import { TransitService } from './transit.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransitService', () => {
  let service: TransitService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransitService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransitService>(TransitService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findNearestStops', () => {
    it('should return an array of nearest stops', async () => {
      const mockStops = [
        {
          id: 1,
          name: 'Stop A',
          latitude: 40.7128,
          longitude: -74.006,
          distance_meters: 500,
        },
        {
          id: 2,
          name: 'Stop B',
          latitude: 40.7138,
          longitude: -74.005,
          distance_meters: 800,
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockStops);
      
      const result = await service.findNearestStops(40.7128, -74.006);
      expect(result).toEqual(mockStops);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  })

  describe('createRoute', () => {
    it('should create a route with stops', async () => {
      const dto = {
        name: 'Route 1',
        stops: [
          { stopId: 1, durationFromStart: 0 },
          { stopId: 2, durationFromStart: 10 },
          { stopId: 3, durationFromStart: 20 },
        ],
      };
      const mockRoute = { id: 1, name: 'Route 1' };
      const mockRouteStops = [
        { id: 1, routeId: 1, stopId: 1, sequence: 1, estTimeFromStart: 0 },
        { id: 2, routeId: 1, stopId: 2, sequence: 2, estTimeFromStart: 10 },
        { id: 3, routeId: 1, stopId: 3, sequence: 3, estTimeFromStart: 20 },
      ];
      prisma.$transaction = jest.fn().mockImplementation(async (cb) => {
        const tx = {
          route: {
            create: jest.fn().mockResolvedValue(mockRoute),
          },
          routeStop: {
            create: jest.fn().mockResolvedValueOnce(mockRouteStops[0])
              .mockResolvedValueOnce(mockRouteStops[1])
              .mockResolvedValueOnce(mockRouteStops[2]),
          },
        };
        return cb(tx);
      });

      const result = await service.createRoute(dto);
      expect(result).toEqual(mockRoute);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('findRoutesBetweenStops', () => {
    it('should return routes between two stops', async () => {
      const mockRoutes = [
        { id: 1, name: 'Route 1' },
        { id: 2, name: 'Route 2' },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockRoutes);
      const result = await service.findRoutesBetweenStops(1, 2);
      expect(result).toEqual(mockRoutes);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('addStopToRoute', () => {
    it('should add a stop to a route at the specified sequence', async () => {
      const mockRouteStop = { id: 1, routeId: 1, stopId: 4, sequence: 2, estTimeFromStart: 15 }; 
      prisma.$transaction = jest.fn().mockImplementation(async (cb) => {
        const tx = {
          routeStop: {
            findFirst: jest.fn().mockResolvedValue(null), // No existing stop at target sequence
            create: jest.fn().mockResolvedValue(mockRouteStop),
          },
        };
        return cb(tx);
      });

      const result = await service.addStopToRoute(1, 4, 2, 15);
      expect(result).toEqual(mockRouteStop);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  })
});
