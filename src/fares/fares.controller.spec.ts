import { Test, TestingModule } from '@nestjs/testing';
import { FareController } from './fares.controller';

describe('FaresController', () => {
  let controller: FareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FareController],
    }).compile();

    controller = module.get<FareController>(FareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a fare successfully', async () => {
      const dto = { routeId: 1, fromStopId: 1, toStopId: 2, price: 100 };
      const mockFareService = {
        upsertFare: jest.fn().mockResolvedValue({ id: 1, ...dto }),
      };
      controller['fareService'] = mockFareService as any;
      const result = await controller.create(dto);
      expect(result).toEqual({ id: 1, ...dto });
    })
  });

  describe('getByRoute', () => {
    it('should return fares for a given route', async () => {
      const routeId = 1;
      const mockFares = [
        { id: 1, routeId: 1, fromStopId: 1, toStopId: 2, price: 100 },
        { id: 2, routeId: 1, fromStopId: 2, toStopId: 3, price: 150 },
      ];
      const mockFareService = {
        getFaresByRoute: jest.fn().mockResolvedValue(mockFares),
      };
      controller['fareService'] = mockFareService as any;
      const result = await controller.getByRoute(routeId);
      expect(result).toEqual(mockFares);
    });
  })

  describe('update', () => {
    it('should update a fare successfully', async () => {
      const id = 1;
      const dto = { price: 120 };
      const mockFareService = {
        updateFare: jest.fn().mockResolvedValue({ id, routeId: 1, fromStopId: 1, toStopId: 2, price: 120 }),
      };
      controller['fareService'] = mockFareService as any;
      const result = await controller.update(id, dto);
      expect(result).toEqual({ id, routeId: 1, fromStopId: 1, toStopId: 2, price: 120 });
    });
  });

  describe('createBulk', () => {
    it('should create fares in bulk successfully', async () => {
      const fares = [
        { routeId: 1, fromStopId: 1, toStopId: 2, price: 100 },
        { routeId: 1, fromStopId: 2, toStopId: 3, price: 150 },
      ];
      const mockFareService = {
        upsertFare: jest.fn()
          .mockResolvedValueOnce({ id: 1, ...fares[0] })
          .mockResolvedValueOnce({ id: 2, ...fares[1] }),
      };
      controller['fareService'] = mockFareService as any;
      const result = await controller.createBulk(fares);
      expect(result).toEqual([
        { id: 1, ...fares[0] },
        { id: 2, ...fares[1] },
      ]);
    });
  })
});
