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
});
