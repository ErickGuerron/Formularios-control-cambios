import { Test, TestingModule } from '@nestjs/testing';
import { RfcService } from './rfc.service';

describe('RfcService', () => {
  let service: RfcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RfcService]
    }).compile();

    service = module.get<RfcService>(RfcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
