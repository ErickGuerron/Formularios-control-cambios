import { Test, TestingModule } from '@nestjs/testing';
import { RfcController } from './rfc.controller';
import { RfcService } from './rfc.service';

describe('RfcController', () => {
  let controller: RfcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RfcController],
      providers: [RfcService]
    }).compile();

    controller = module.get<RfcController>(RfcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
