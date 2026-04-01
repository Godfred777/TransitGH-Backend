import { Test, TestingModule } from '@nestjs/testing';
import { FareService } from './fares.service';

describe('FareService', () => {
  let service: FareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FareService],
    }).compile();

    service = module.get<FareService>(FareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateFare', () => {
    it('should return the fare price for a valid route and stops', async () => {
      // Mock the PrismaService to return a fare
      const mockFare = { price: 100 };
      service['prisma'] = {
        fare: {
          findUnique: jest.fn().mockResolvedValue(mockFare),
        },
      } as any;
      const price = await service.calculateFare(1, 1, 2);
      expect(price).toBe(100);
    });

    it('should throw NotFoundException if fare is not defined for the segment', async () => {
      service['prisma'] = {
        fare: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      } as any;
      await expect(service.calculateFare(1, 1, 2)).rejects.toThrow('Fare not defined for this segment');
    });
  });

  describe('createFare', () => {
    it('should create a fare successfully', async () => {
      const dto = { routeId: 1, fromStopId: 1, toStopId: 2, price: 100 };
      const mockCreatedFare = { id: 1, ...dto };
      service['prisma'] = {
        fare: {
          create: jest.fn().mockResolvedValue(mockCreatedFare),
        },
      } as any;
      const result = await service.createFare(dto);
      expect(result).toEqual(mockCreatedFare);
    });

    it('should throw ConflictException if fare for the stop-pair already exists', async () => {
      const dto = { routeId: 1, fromStopId: 1, toStopId: 2, price: 100 };
      service['prisma'] = {
        fare: {
          create: jest.fn().mockRejectedValue({ code: 'P2002' }),
        },
      } as any;
      await expect(service.createFare(dto)).rejects.toThrow('Fare for this specific stop-pair already exists.');
    });
  });

  describe('updateFare', () => {
    it('should update the fare price successfully', async () => {
      const fareId = 1;
      const dto = { price: 150 };
      const mockUpdatedFare = { id: fareId, routeId: 1, fromStopId: 1, toStopId: 2, price: 150 };
      service['prisma'] = {
        fare: {
          update: jest.fn().mockResolvedValue(mockUpdatedFare),
        },
      } as any;
      const result = await service.updateFare(fareId, dto);
      expect(result).toEqual(mockUpdatedFare);
    });

    it('should throw NotFoundException if fare with the given ID is not found', async () => {
      const fareId = 999;
      const dto = { price: 150 };
      service['prisma'] = {
        fare: {
          update: jest.fn().mockRejectedValue(new Error('Not found')),
        },
      } as any;
      await expect(service.updateFare(fareId, dto)).rejects.toThrow(`Fare with ID ${fareId} not found`);
    });
  })

  describe('upsertFare', () => {
    it('should create a new fare if it does not exist', async () => {
      const dto = { routeId: 1, fromStopId: 1, toStopId: 2, price: 100 };
      const mockCreatedFare = { id: 1, ...dto };
      service['prisma'] = {
        fare: {
          upsert: jest.fn().mockResolvedValue(mockCreatedFare),
        },
      } as any;
      const result = await service.upsertFare(dto);
      expect(result).toEqual(mockCreatedFare);
    });
  })

  describe('getFaresByRoute', () => {
    it('should return the fare price for a valid route and stops', async () => {
      const mockFare = { price: 100 };
      service['prisma'] = {
        fare: {
          findUnique: jest.fn().mockResolvedValue(mockFare),
        },
      } as any;
      const price = await service.getFaresByRoute(1);
      expect(price).toBe(100);
    });
  })
});
