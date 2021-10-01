

import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FilesRepositoryMock, MultimediaRepositoryMock } from '../../../../test/mockCrudRepository/crudRepository.mock';
import { IFileStorageService } from '../../file-storage/services/file-storage.service.interface';
import { CloudFileStorageService } from '../../file-storage/services/cloud-file-storage.service';
// import { MultimediaResponse } from '../model/dto/MultimediaResponse';
import { Multimedia } from '../model/entities/multimedia.entity';
import { MultimediaCrudService } from './multimedia.crud.service';
import { Files } from '../model/entities/files.entity';

const path = require('path');
require('dotenv').config({ path: path.resolve('src/.env') });

describe('MultimdeiaCrudService', () => {
  let multimediaCrudService: MultimediaCrudService;
  let multimediaMockRepo: MultimediaRepositoryMock;
  let fileStorageService: IFileStorageService;
  let filesRepositoryMock: FilesRepositoryMock;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultimediaCrudService,
        CloudFileStorageService,
        {
          provide: getRepositoryToken(Multimedia),
          useClass: MultimediaRepositoryMock,
        },
        {
          provide: getRepositoryToken(Files),
          useClass: FilesRepositoryMock,
        },
        {
          provide: 'IFileStorageService',
          useClass: CloudFileStorageService,
        },
      ],
    }).compile();

    multimediaCrudService = module.get<MultimediaCrudService>(MultimediaCrudService);
    multimediaMockRepo = module.get<MultimediaRepositoryMock>(getRepositoryToken(Multimedia));
    filesRepositoryMock = module.get<FilesRepositoryMock>(getRepositoryToken(Files));
    fileStorageService = module.get<CloudFileStorageService>('IFileStorageService');
    // fileStorageService = mock<IFileStorageService>();  //TODO --> Interface mocking not done//need to verify this
  });

  it('should be defined after module initialization', () => {
    expect(multimediaCrudService).toBeDefined();
    expect(multimediaMockRepo).toBeDefined();
    expect(fileStorageService).toBeDefined();
    expect(filesRepositoryMock).toBeDefined();
  });

  describe('uploadFile', () => {
    // inputs
    const file: any = {
      fieldname: 'file',
      originalname: 'logo(5).png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer:
        '<Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 07 80 00 00 04 38 08 06 00 00 00 e8 d3 c1 43 00 00 00 01 73 52 47 42 00 ae ce 1c e9 00 00 00 04 ... 202440 more bytes>',
      size: 202490,
    };
    const teamId = "46455bf7-ada7-495c-8019-8d7ab76d488e";

    it('should return the multimedia entity which is uploaded', async () => {

      const uploadedFile: any = {
        ETag: '"b909798a5cbeeb595fb9cdbb79e86b87"',
        Location: '',
        key: 'uploads/uploads/multimedia/46455bf7-ada7-495c-8019-8d7ab76d488e/logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
        Key: 'uploads/uploads/multimedia/46455bf7-ada7-495c-8019-8d7ab76d488e/logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
        Bucket: 'powerboard-test'
      }

      const files: Files[] = []
      const savedMultimedia: Multimedia = {
        fileName: 'logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
        team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
        albumName: '',
        id: 'cbad5f43-396e-4abb-9e55-4036f58bede7',
        version: 1,
        createdAt: '2021-09-30T09:40:10.685Z',
        updatedAt: '2021-09-30T09:40:10.685Z',
        inSlideshow: false,
        files: files
      }

      jest.spyOn(fileStorageService, 'uploadFile').mockResolvedValue(uploadedFile);
      jest.spyOn(multimediaMockRepo, 'save').mockResolvedValue(savedMultimedia);
      const result = await multimediaCrudService.uploadFile(file, teamId);
      //expect(result).toEqual(updatedResult);
      expect(multimediaMockRepo.save).toBeCalled();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('fileName');
      expect(result).toHaveProperty('albumName');
      expect(result).toHaveProperty('inSlideshow');
    })
    it('should return undefined if the file is not uploaded ', async () => {

      jest.spyOn(fileStorageService, 'uploadFile').mockResolvedValue(undefined);

      expect(await multimediaCrudService.uploadFile(file, teamId)).toBeUndefined();
    })
  })
  describe('uploadFileToFolder', () => {
    //inputs
    const teamId = '46455bf7-ada7-495c-8019-8d7ab76d488e';
    const albumId = 'aaad19f7-1b66-44aa-a443-4fcdd173f385';
    const fileToBeUploaded: any = {}

    const files: Files[] = []
    const multimedia: Multimedia = {
      fileName: 'logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
      team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
      albumName: 'resort',
      id: 'cbad5f43-396e-4abb-9e55-4036f58bede7',
      version: 1,
      createdAt: '2021-09-30T09:40:10.685Z',
      updatedAt: '2021-09-30T09:40:10.685Z',
      inSlideshow: false,
      files: files
    }
    it('should return the uploaded file entity ', async () => {
      const uploadedFile: any = {
        ETag: '"b909798a5cbeeb595fb9cdbb79e86b87"',
        Location: '',
        key: 'uploads/uploads/multimedia/46455bf7-ada7-495c-8019-8d7ab76d488e/logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
        Key: 'uploads/uploads/multimedia/46455bf7-ada7-495c-8019-8d7ab76d488e/logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
        Bucket: 'powerboard-test'
      }
      const file = {
        fileName: 'logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
        album: 'resort',
        id: 'cbad5f43-396e-4abb-9e55-4036f58bede7',
        version: 1,
        createdAt: '2021-09-30T09:40:10.685Z',
        updatedAt: '2021-09-30T09:40:10.685Z',
      } as Files
      jest.spyOn(multimediaMockRepo, 'findOne').mockResolvedValue(multimedia);
      jest.spyOn(fileStorageService, 'uploadFile').mockResolvedValue(uploadedFile);
      jest.spyOn(filesRepositoryMock, 'save').mockResolvedValue(file);

      const result = await multimediaCrudService.uploadFileToFolder(teamId, albumId, fileToBeUploaded);
      expect(result).toBeDefined();
      expect(filesRepositoryMock.save).toBeCalledTimes(1);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('album');
      expect(result).toHaveProperty('fileName');
    })
    it('should return undefined if the file is not uploaded ', async () => {
      jest.spyOn(multimediaMockRepo, 'findOne').mockResolvedValue(multimedia);
      jest.spyOn(fileStorageService, 'uploadFile').mockResolvedValue(undefined);

      expect(await multimediaCrudService.uploadFileToFolder(teamId, albumId, fileToBeUploaded)).toBeUndefined();
    })
  });
  describe('getDefaultMultimediaForTeam()', () => {
    it('should return the default root multimedia for team ', async () => {
      const teamId = '46455bf7-ada7-495c-8019-8d7ab76d488e';
      const files: Files[] = [
        {
          fileName: 'logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd7.png',
          album: 'resort',
          id: 'cbad5f43-396e-4abb-9e55-4036f58bede7',
          version: 1,
          createdAt: '2021-09-30T09:40:10.685Z',
          updatedAt: '2021-09-30T09:40:10.685Z',
        },
        {
          fileName: 'logo(7)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
          album: 'birthday',
          id: 'cbad5f43-396e-4abb-9e55-4036f58bed96',
          version: 1,
          createdAt: '2021-09-30T09:40:10.685Z',
          updatedAt: '2021-09-30T09:40:10.685Z',
        },
      ]
      const multimediaArray: any = [
        {
          fileName: null,
          team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
          albumName: 'resort',
          id: 'cbad5f43-396e-4abb-9e55-4036f58bede7',
          version: 1,
          createdAt: '2021-09-30T09:40:10.685Z',
          updatedAt: '2021-09-30T09:40:10.685Z',
          inSlideshow: false,
          files: files
        },
        {
          fileName: null,
          team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
          albumName: 'birthday',
          id: 'cbad5f43-396e-4abb-9e55-4036f58bede9',
          version: 1,
          createdAt: '2021-09-30T09:40:10.685Z',
          updatedAt: '2021-09-30T09:40:10.685Z',
          inSlideshow: false,
          files: files
        },
        {
          fileName: 'altrand72e3352-0353-4e5f-8fa3-5a25444f0c62.jpg',
          team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
          albumName: null,
          id: 'cbad5f43-396e-4abb-9e55-4036f58bede9',
          version: 1,
          createdAt: '2021-09-30T09:40:10.685Z',
          updatedAt: '2021-09-30T09:40:10.685Z',
          inSlideshow: false,
          files: files
        }
      ]
      const rootfilesResponse: any = {
        fileId: 'cbad5f43-396e-4abb-9e55-4036f58bede9',
        fileName: 'altrand72e3352-0353-4e5f-8fa3-5a25444f0c62.jpg',
        inSlideShow: false
      }

      const displayResponse: any = {
        id: 'cbad5f43-396e-4abb-9e55-4036f58bede9',
        urlName: 'altrand72e3352-0353-4e5f-8fa3-5a25444f0c62.jpg',
        inSlideShow: false
      }
      const folderList: any =
        [
          {
            folderId: 'cbad5f43-396e-4abb-9e55-4036f58bede7',
            folderName: 'resort'
          },
          {
            folderId: 'cbad5f43-396e-4abb-9e55-4036f58bede9',
            folderName: 'birthday'
          },
        ]
      const multimediaResponse = {
        display: displayResponse,
        root: folderList
      }
      jest.spyOn(multimediaMockRepo, 'find').mockResolvedValue(multimediaArray);
      jest.spyOn(multimediaCrudService, 'getCommonFiles').mockImplementation(() => rootfilesResponse);
      jest.spyOn(multimediaCrudService, 'getDisplay').mockImplementation(() => displayResponse);
      // jest.spyOn(multimediaCrudService,'getDisplayFilesFromFolder').mockImplementation(()=>);
      jest.spyOn(multimediaCrudService, 'getFolderList').mockImplementation(() => folderList);
      const result = await multimediaCrudService.getDefaultMultimediaForTeam(teamId);
      expect(result).toBeDefined();
      expect(result).toEqual(multimediaResponse);

    })
  })
  describe('getDisplay()', () => {
    it('should return the files display', async () => {

      const files: any = [
        {
          fileId: '73eaf00a-f1fe-4573-8cbb-324499c39431',
          fileName: 'altrand72e3352-0353-4e5f-8fa3-5a25444f0c62.jpg',
          inSlideshow: true
        },
        {
          fileId: '73eaf00a-f1fe-4573-8cbb-324499c39432',
          fileName: 'alt72e3352-0353-4e5f-8fa3-5a25444f0c62.jpg',
          inSlideshow: true
        }
      ]
      const result = await multimediaCrudService.getDisplay(files);
      expect(result.length).toBe(2);
      expect(result).toBeDefined();
    })
    describe('addFiles()', () => {
      it('should add files', async () => {
        const files: any = [
          {
            fileId: '73eaf00a-f1fe-4573-8cbb-324499c39431',
            fileName: 'altrand72e3352-0353-4e5f-8fa3-5a25444f0c62.jpg',
            inSlideshow: true
          },
          {
            fileId: '73eaf00a-f1fe-4573-8cbb-324499c39432',
            fileName: 'alt72e3352-0353-4e5f-8fa3-5a25444f0c62.jpg',
            inSlideshow: true
          }
        ]
        const albumName = 'resort';
        const inSlideShow = true;
        const link = 'https//abc';

        const result = await multimediaCrudService.addFiles(files, albumName, inSlideShow, link);
        expect(result.length).toBe(2);
        expect(result).toBeDefined();

      })
    })
    describe('getDisplayFilesFromFolder()', () => {
      it('should return display files for a folder', async () => {
        const files: Files[] = [
          {
            fileName: 'logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd7.png',
            album: 'resort',
            id: 'cbad5f43-396e-4abb-9e55-4036f58bede7',
            version: 1,
            createdAt: '2021-09-30T09:40:10.685Z',
            updatedAt: '2021-09-30T09:40:10.685Z',
          },
          {
            fileName: 'logo(7)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
            album: 'birthday',
            id: 'cbad5f43-396e-4abb-9e55-4036f58bed96',
            version: 1,
            createdAt: '2021-09-30T09:40:10.685Z',
            updatedAt: '2021-09-30T09:40:10.685Z',
          },
        ]
        const multimediaArray: any = [
          {
            fileName: null,
            team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
            albumName: 'resort',
            id: 'cbad5f43-396e-4abb-9e55-4036f58bede7',
            version: 1,
            createdAt: '2021-09-30T09:40:10.685Z',
            updatedAt: '2021-09-30T09:40:10.685Z',
            inSlideshow: false,
            files: files
          },
          {
            fileName: null,
            team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
            albumName: 'birthday',
            id: 'cbad5f43-396e-4abb-9e55-4036f58bede9',
            version: 1,
            createdAt: '2021-09-30T09:40:10.685Z',
            updatedAt: '2021-09-30T09:40:10.685Z',
            inSlideshow: false,
            files: files
          }

        ]
        const link = 'https//abc'
        const result = await multimediaCrudService.getDisplayFilesFromFolder(multimediaArray, link);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);
      })
      it('should return empty array if the files are not present in any sub folder', async () => {
        const files: Files[] = []
        const multimediaArray: any = [
          {
            fileName: 'logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd7.png',
            team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
            albumName: '',
            id: 'cbad5f43-396e-4abb-9e55-4036f58bede7',
            version: 1,
            createdAt: '2021-09-30T09:40:10.685Z',
            updatedAt: '2021-09-30T09:40:10.685Z',
            inSlideshow: false,
            files: files
          },
          {
            fileName: 'logo(7)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
            team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
            albumName: '',
            id: 'cbad5f43-396e-4abb-9e55-4036f58bede9',
            version: 1,
            createdAt: '2021-09-30T09:40:10.685Z',
            updatedAt: '2021-09-30T09:40:10.685Z',
            inSlideshow: false,
            files: files
          }
        ]
        const link = 'https//abc'
        const result = await multimediaCrudService.getDisplayFilesFromFolder(multimediaArray, link);
        expect(result).toBeDefined();
        expect(result.length).toBe(0);
      })
    })
    describe('getFolderList()', () => {
      it('should return list of sub folders', async () => {
        const files: Files[] = [];
        const multimediaArray: any = [
          {
            fileName: null,
            team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
            albumName: 'resort',
            id: 'cbad5f43-396e-4abb-9e55-4036f58bede7',
            version: 1,
            createdAt: '2021-09-30T09:40:10.685Z',
            updatedAt: '2021-09-30T09:40:10.685Z',
            inSlideshow: false,
            files: files
          },
          {
            fileName: null,
            team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
            albumName: 'birthday',
            id: 'cbad5f43-396e-4abb-9e55-4036f58bede9',
            version: 1,
            createdAt: '2021-09-30T09:40:10.685Z',
            updatedAt: '2021-09-30T09:40:10.685Z',
            inSlideshow: false,
            files: files
          }
        ]

        const result = await multimediaCrudService.getFolderList(multimediaArray);
        expect(result).toBeDefined()
        expect(result.length).toBe(2);

      })
    })
  })
})
    // updated result
    // Multimedia {
    // fileName: 'https://powerboard-test.s3.eu-central-1.amazonaws.com/uploads/uploads/multimedia/46455bf7-ada7-495c-8019-8d7ab76d488e/logo(5)68cfe4b3-be2d-48a1-a9f5-abaf28125dd2.png',
    // team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
    // albumName: null,
    // id: 'cbad5f43-396e-4abb-9e55-4036f58bede7',
    // version: 1,
    // createdAt: 2021-09-30T09:40:10.685Z,
    // updatedAt: 2021-09-30T09:40:10.685Z,
    // inSlideshow: false
    // const teamId: string = '46455bf7-ada7-495c-8019-8d7ab76d488e';
    // describe('getFilesForTeam()', () => {
    //   it('getFilesForTeam() should return all the files present in the database', async () => {
    //     const files: Multimedia[] = [
    //       {
    //         id: '52055bf8-ada5-495c-8019-8d7ab76d488e',
    //         version: 1,
    //         createdAt: '2021-04-29T05:56:27.392Z',
    //         updatedAt: '2021-04-29T05:56:27.392Z',
    //         fileName: 'jirab05d9639-10f5-4ec5-85bf-087731ce4f8b.png',
    //         team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
    //       },
    //       {
    //         id: '52155bf8-ada5-495c-8019-8d7ab76d488e',
    //         version: 1,
    //         createdAt: '2021-04-29T05:56:27.392Z',
    //         updatedAt: '2021-04-29T05:56:27.392Z',
    //         fileName: 'power46455bf7-ada7-495c-8019-8d7ab76d497e.png',
    //         team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
    //       },
    //     ];
    //     const expectedMultimediaResponses: MultimediaResponse[] = [
    //       {
    //         fileId: '52055bf8-ada5-495c-8019-8d7ab76d488e',
    //         fileName: 'jirab05d9639-10f5-4ec5-85bf-087731ce4f8b.png',
    //       },
    //       {
    //         fileId: '52155bf8-ada5-495c-8019-8d7ab76d488e',
    //         fileName: 'power46455bf7-ada7-495c-8019-8d7ab76d497e.png',
    //       },
    //     ];

    //     jest.spyOn(multimediaMockRepo, 'find').mockImplementation(() => files);
    //     const actualMultimediaResponse = await multimediaCrudService.getFilesForTeam(teamId);
    //     expect(multimediaMockRepo.find).toBeCalledTimes(1);
    //     expect(actualMultimediaResponse).toBeDefined();
    //     expect(actualMultimediaResponse).toEqual(expectedMultimediaResponses);
    //   });
    // });

    // describe('setFilePath', () => {
    //   it('setFilePath() should save the image ', async () => {
    // const uploadedFile = {
    //   fieldname: 'file',
    //   originalname: 'power.png',
    //   encoding: '7bit',
    //   mimetype: 'image/png',
    //   buffer:
    //     '<Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 07 80 00 00 04 38 08 06 00 00 00 e8 d3 c1 43 00 00 00 01 73 52 47 42 00 ae ce 1c e9 00 00 00 04 ... 202440 more bytes>',
    //   size: 202490,
    // };
    //     const teamId = '46455bf7-ada7-495c-8019-8d7ab76d488e';
    //     const expectedSavedFileResponse: Multimedia = {
    //       fileName: 'powerb60f5d38-7a1e-430e-9d88-0a620359f191.png',
    //       team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
    //       id: 'd123011a-7fd0-4237-b1b5-d3fc657d2467',
    //       version: 1,
    //       createdAt: '2021-04-29T05:56:27.392Z',
    //       updatedAt: '2021-04-29T05:56:27.392Z',
    //     };

    //     const fileName = 'powerb60f5d38-7a1e-430e-9d88-0a620359f191.png';
    //     jest.spyOn(multimediaMockRepo, 'save').mockImplementation(() => expectedSavedFileResponse);
    //     jest.spyOn(fileStorageService, 'uploadFile').mockResolvedValue(fileName);
    //     const actualImageResponse = await multimediaCrudService.uploadFile(uploadedFile, teamId);
    //     expect(multimediaMockRepo.save).toBeCalledTimes(1);
    //     expect(actualImageResponse).toBeDefined();
    //     expect(actualImageResponse).toEqual(expectedSavedFileResponse);
    //   });
    // });

    // it('deleteFileById() should delete the given file ', async () => {
    //   const file: Multimedia = {
    //     id: '52055bf8-ada5-495c-8019-8d7ab76d488e',
    //     version: 1,
    //     createdAt: '2021-04-29T05:56:27.392Z',
    //     updatedAt: '2021-04-29T05:56:27.392Z',
    //     fileName: 'jirab05d9639-10f5-4ec5-85bf-087731ce4f8b.png',
    //     team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
    //   };
    //   const fileId: string = 'd123011a-7fd0-4237-b1b5-d3fc657d2467';
    //   const teamId: string = '46455bf7-ada7-495c-8019-8d7ab76d488e';
    //   jest.spyOn(multimediaMockRepo, 'findOne').mockImplementation(() => file);
    //   jest.spyOn(multimediaMockRepo, 'delete').mockImplementation(() => undefined);
    //   jest.spyOn(fileStorageService, 'deleteFile').mockResolvedValue(true);
    //   await multimediaCrudService.deleteFileById(fileId, teamId);
    //   expect(multimediaMockRepo.delete).toBeCalledTimes(1);
    //   //expect(multimediaMockRepo.delete).toBeCalledWith(file);
    // });
