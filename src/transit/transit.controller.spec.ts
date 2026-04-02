import { Test, TestingModule } from '@nestjs/testing';
import { TransitController } from './transit.controller';
import { TransitService } from './transit.service';

describe('TransitController', () => {
  let controller: TransitController;
  let transitService: TransitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransitController],
      providers: [
        {
          provide: TransitService,
          useValue: {
            findRoutesBetweenStops: jest.fn(),
            findNearestStops: jest.fn(),
            createRoute: jest.fn(),
            addStopToRoute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransitController>(TransitController);
    transitService = module.get<TransitService>(TransitService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should return routes between stops', async () => {
      const mockRoutes = [{ id: 1, name: 'Route 1' }];
      transitService.findRoutesBetweenStops = jest.fn().mockResolvedValue(mockRoutes);
      const result = await controller.search(1, 5);
      expect(result).toEqual(mockRoutes);
      expect(transitService.findRoutesBetweenStops).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('nearestStops', () => {
    it('should return nearest stops', async () => {
      const mockStops = [{ id: 1, name: 'Stop A' }];
      transitService.findNearestStops = jest.fn().mockResolvedValue(mockStops);
      const result = await controller.nearestStops(40.7128, -74.006);
      expect(result).toEqual(mockStops);
      expect(transitService.findNearestStops).toHaveBeenCalledWith(40.7128, -74.006, 1000);
    });
  });

  describe('create', () => {
    it('should create a route', async () => {
      const dto = { name: 'Route 1', stops: [] };
      const mockRoute = { id: 1, name: 'Route 1' };
      transitService.createRoute = jest.fn().mockResolvedValue(mockRoute);
      const result = await controller.create(dto);
      expect(result).toEqual(mockRoute);
      expect(transitService.createRoute).toHaveBeenCalledWith(dto);
    });
  });

  describe('addStopToRoute', () => {
    it('should add a stop to a route', async () => {
      const mockResult = { success: true };
      transitService.addStopToRoute = jest.fn().mockResolvedValue(mockResult);
      const result = await controller.addStopToRoute(1, 2, 1, 10);
      expect(result).toEqual(mockResult);
      expect(transitService.addStopToRoute).toHaveBeenCalledWith(1, 2, 1, 10);
    });
  });
});
