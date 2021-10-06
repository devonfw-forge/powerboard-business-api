import { Test, TestingModule } from '@nestjs/testing';
import { MultimediaMockService } from '../../../../test/mockedServices/multimedia.service.mock';
import { Multimedia } from '../model/entities/multimedia.entity';
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

    describe('getAllAlbums()', () => {
        it('should return all the folders/albums present in the DB', async () => {
            const teamId = '46455bf7-ada7-495c-8019-8d7ab76d488e';
            const mockResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
                json: jest.fn(),
            };
            const getAllAlbums = {} as Multimedia[];

            jest.spyOn(multimediaService, 'getAllFilesInFolderForTeam').mockImplementation(() => getAllAlbums);
            await multimediaController.getAllAlbums(teamId, mockResponse);
            expect(mockResponse.status).toBeCalledTimes(1);
            expect(mockResponse.status).toBeCalledWith(200);
        })
    })

    describe('uploadImage()', () => {
        it('should upload the image properly', async () => {
            const teamId = '46455bf7-ada7-495c-8019-8d7ab76d488e';
            const mockResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
                json: jest.fn(),
            };

            const file: any = {
                fieldname: 'file',
                originalname: 'logo(5).png',
                encoding: '7bit',
                mimetype: 'image/png',
                buffer:
                    '<Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 07 80 00 00 04 38 08 06 00 00 00 e8 d3 c1 43 00 00 00 01 73 52 47 42 00 ae ce 1c e9 00 00 00 04 ... 202440 more bytes>',
                size: 202490,
            };
            const uploadedFile: any = {
                ETag: '"b909798a5cbeeb595fb9cdbb79e86b87"',
                Location: '',
                key: 'uploads/uploads/multimedia/46455bf7-ada7-495c-8019-8d7ab76d488e/logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
                Key: 'uploads/uploads/multimedia/46455bf7-ada7-495c-8019-8d7ab76d488e/logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
                Bucket: 'powerboard-test'
            }
            jest.spyOn(multimediaService, 'uploadFile').mockImplementation(() => uploadedFile);
            await multimediaController.uploadImage(file, teamId, mockResponse);
            expect(mockResponse.status).toBeCalledTimes(1);
            expect(mockResponse.status).toBeCalledWith(201);
        })
    })
})