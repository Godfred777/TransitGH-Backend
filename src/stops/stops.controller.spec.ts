import { Test, TestingModule } from '@nestjs/testing';
import { StopsController } from './stops.controller';

describe('StopsController', () => {
  let controller: StopsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StopsController],
    }).compile();

    controller = module.get<StopsController>(StopsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a stop', async () => {
      const data = { name: 'Test Stop', latitude: 40.7128, longitude: -74.0060 };
      const result = { id: 1, ...data };
      jest.spyOn(controller['stopsService'], 'createStop').mockResolvedValue(result);

      expect(await controller.create(data)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of stops', async () => {
      const result = [{ id: 1, name: 'Test Stop', latitude: 40.7128, longitude: -74.0060 }];
      jest.spyOn(controller['stopsService'], 'getAllStops').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('updateLocation', () => {
    it('should update the location of a stop', async () => {
      const id = 1;
      const latitude = 40.7128;
      const longitude = -74.0060;
      const result = { id, name: 'Test Stop', latitude, longitude };
      jest.spyOn(controller['stopsService'], 'updateStopLocation').mockResolvedValue(result);
      expect(await controller.updateLocation(id, latitude, longitude)).toEqual(result);
    });
  });
});
