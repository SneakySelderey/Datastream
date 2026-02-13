import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ScannerService } from './scanner.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScannerGateway } from './scanner.gateway';

describe('ScannerService', () => {
  let service: ScannerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScannerService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ScannerGateway,
          useValue: { emitProgress: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) =>
              key === 'COVERS_CACHE_PATH' ? '/data/covers' : defaultValue
            ),
          },
        },
      ],
    }).compile();

    service = module.get<ScannerService>(ScannerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
