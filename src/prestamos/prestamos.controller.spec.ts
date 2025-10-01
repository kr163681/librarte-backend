import { Test, TestingModule } from '@nestjs/testing';
import { PrestamosController } from './prestamos.controller';

describe('PrestamosController', () => {
  let controller: PrestamosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrestamosController],
    }).compile();

    controller = module.get<PrestamosController>(PrestamosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
