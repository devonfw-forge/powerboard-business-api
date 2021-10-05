import { Test, TestingModule } from '@nestjs/testing';
import { MultimediaMockService } from '../../../../test/mockedServices/multimedia.service.mock';
import { MultimediaCrudController } from './multimedia.crud.controller';


describe('Multimedia Controller', () => {
    let multimediaController: MultimediaCrudController;
    let multimediaService: MultimediaMockService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MultimediaCrudController],
            providers: [
                {
                    provide: 'IMultimediaService',
                    useClass: MultimediaMockService,
                },
            ],
        }).compile();

        multimediaController = module.get<MultimediaCrudController>(MultimediaCrudController);
        multimediaService = module.get<MultimediaMockService>('IMultimediaService');
    })
    it('should be defined after module initialization', () => {
        expect(multimediaController).toBeDefined();
        expect(multimediaService).toBeDefined();
    });
})