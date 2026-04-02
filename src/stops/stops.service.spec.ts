import { Test, TestingModule } from '@nestjs/testing';
import { StopsService } from './stops.service';

describe('StopsService', () => {
  let service: StopsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StopsService],
    }).compile();

    service = module.get<StopsService>(StopsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStop', () => {
    it('should create a stop with valid data', async () => {
      const dto = { name: 'Test Stop', latitude: 40.7128, longitude: -74.0060 };
      const result = await service.createStop(dto);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(dto.name);
      expect(result.latitude).toEqual(dto.latitude);
      expect(result.longitude).toEqual(dto.longitude);
    });
    it('should throw an error for invalid latitude', async () => {
      const dto = { name: 'Invalid Latitude Stop', latitude: 100, longitude: -74.0060 };
      await expect(service.createStop(dto)).rejects.toThrow('Invalid Latitude');
    });
    it('should throw an error for invalid longitude', async () => {
      const dto = { name: 'Invalid Longitude Stop', latitude: 40.7128, longitude: -190 };
      await expect(service.createStop(dto)).rejects.toThrow('Invalid Longitude');
    });
  })

  describe('getAllStops', () => {
    it('should return an array of stops', async () => {
      const result = await service.getAllStops();
      expect(Array.isArray(result)).toBe(true);
    });
  })

  describe('updateStopLocation', () => {
    it('should update the location of a stop', async () => {
      const createdStop = await service.createStop({ name: 'Update Test Stop', latitude: 40.7128, longitude: -74.0060 });
      const updatedStop = await service.updateStopLocation(createdStop.id, 41.0000, -75.0000);
      expect(updatedStop.latitude).toEqual(41.0000);
      expect(updatedStop.longitude).toEqual(-75.0000);
    });
  })
});
