import { Test, TestingModule } from '@nestjs/testing';
import { StreamController } from './stream.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('StreamController', () => {
  let controller: StreamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamController],
      providers: [
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<StreamController>(StreamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
