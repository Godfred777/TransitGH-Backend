import { Test, TestingModule } from '@nestjs/testing';
import { PaymentWebhookController } from './payment.controller';

describe('PaymentWebhookController', () => {
  let controller: PaymentWebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentWebhookController],
    }).compile();

    controller = module.get<PaymentWebhookController>(PaymentWebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    it('should return received status', async () => {
      const signature = 'valid_signature';
      const event = { event: 'charge.success', data: { reference: 'test_ref' } };
      const result = await controller.handleWebhook(signature, event);
      expect(result).toEqual({ status: 'received' });
    });
  })
});
