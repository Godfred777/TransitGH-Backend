import { Test, TestingModule } from '@nestjs/testing';
import { PaystackService } from './paystack.service';

describe('PaystackService', () => {
  let service: PaystackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaystackService],
    }).compile();

    service = module.get<PaystackService>(PaystackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeTransaction', () => {
    it('should initialize a transaction and return authorization data', async () => {
      const email = 'godfred.opintan@icloud.com'
      const amountGHS = 50;
      const bookingId = 123;
      const result = await service.initializeTransaction(email, amountGHS, bookingId);
      expect(result).toHaveProperty('authorization_url');
      expect(result).toHaveProperty('access_code');
      expect(result).toHaveProperty('reference');
    });

    it('should throw an error if initialization fails', async () => {
      jest.spyOn(service, 'initializeTransaction').mockRejectedValue(new Error('Initialization Failed'));
      await expect(service.initializeTransaction('godfred.opintan@icloud.com', 0, 0)).rejects.toThrow('Initialization Failed');
    });
  })

  describe('verifyTransaction', () => {
    it('should verify a transaction and return status', async () => {
      const reference = 'valid_reference';
      const result = await service.verifyTransaction(reference);
      expect(result).toHaveProperty('status');
    });
  })
  
});
