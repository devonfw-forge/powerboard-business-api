import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { IFileStorageService } from '../../file-storage/services/file-storage.service.interface';
import { FolderResponse } from '../model/dto/FolderResponse';
import { RootResponse } from '../model/dto/RootResponse';
import { FileResponse } from '../model/dto/FileResponse';
import { MultimediaResponse } from '../model/dto/MultimediaResponse';
import { Files } from '../model/entities/files.entity';
import { Multimedia } from '../model/entities/multimedia.entity';
import { IMultimediaService } from './multimedia.crud.service.interface';
import * as dotenv from 'dotenv';
import { DisplayResponse } from '../model/dto/DisplayResponse';

dotenv.config();
//const Thumbler = require('thumbler');

@Injectable()
export class MultimediaCrudService extends TypeOrmCrudService<Multimedia> implements IMultimediaService {
  constructor(
    @InjectRepository(Multimedia) private readonly multimediaRepository: Repository<Multimedia>, // @Inject(forwardRef(() => TeamCrudService)) // private teamService: TeamCrudService,
    @InjectRepository(Files) private readonly filesRepository: Repository<Files>,
    @Inject('IFileStorageService') private readonly fileStorageService: IFileStorageService,
  ) {
    super(multimediaRepository);
  }
  videos = ['mp4', '3gp', 'ogg'];
  multimediaResponse: MultimediaResponse = {} as MultimediaResponse;
  fileResponse: FileResponse = {} as FileResponse;
  rootResponse: RootResponse = {} as RootResponse;
  folderResponse: FolderResponse = {} as FolderResponse;
  displayResponse: DisplayResponse = {} as DisplayResponse;
  globalLink = process.env.AWS_URL;
  /**
   * setImagePath method will set image fot that team
   * @param {teamId, path} .Takes teamId and path as input
   * @return {Images} Images as response for that team
   */
  async uploadFile(file: any, teamId: string): Promise<any> {
    let multimedia = new Multimedia();
    // console.log('Multimedia Service');
    // console.log(file);
    const originalPath = `uploads/multimedia/${teamId}/`;

    const output = await this.fileStorageService.uploadFile(file, originalPath);
    console.log('This is output');
    console.log(output);

    if (output) {
      const key = output.Key.split('/');
      multimedia.albumName = key[key.length - 1];
      multimedia.team = teamId;
      console.log(multimedia);
      console.log(multimedia.team);
      const result = await this.multimediaRepository.save(multimedia);
      // if (result && this.videos.includes(output.split('.')[1])) {
      //   this.fileStorageService.saveThumbail(output, originalPath);
      // }
      return result;
    }
  }

  async uploadFileToFolder(teamId: string, albumId: string, file: any): Promise<any> {
    const multimedia = (await this.multimediaRepository.findOne({ where: { id: albumId } })) as Multimedia;
    const albumName = multimedia.albumName;
    let fileEntry = new Files();
    const originalPath = `uploads/multimedia/${teamId}/${albumName}/`;
    const fileUploaded = await this.fileStorageService.uploadFile(file, originalPath);
    if (fileUploaded) {
      const key = fileUploaded.Key.split('/');
      fileEntry.fileName = key[key.length - 1];
      fileEntry.album = multimedia.id;
      const fileSaved = await this.filesRepository.save(fileEntry);
      return fileSaved;
    }
  }

  /**
   * getFilesForTeam method will fetch all images fot that team
   * @param {teamId} .Takes teamId as input
   * @return {MultimediaResponse} MultimediaResponse[] as response for that team
   */
  async getDefaultMultimediaForTeam(teamId: string): Promise<MultimediaResponse> {
    const link = `${this.globalLink}/${teamId}/`;
    const result = await this.multimediaRepository.find({ where: { team: teamId } });
    console.log(result);
    if (result == null) {
      throw new NotFoundException('not found');
    } else {
      let rootFiles = this.getCommonFiles(result, link);

      if (rootFiles.length != 0) {
        this.multimediaResponse.display = this.getDisplay(rootFiles);
      } else {
        this.multimediaResponse.display = this.getDisplayFilesFromFolder(result, link);
      }
      this.multimediaResponse.root = this.getFolderList(result);
      return this.multimediaResponse;
    }
  }
  getDisplay(files: FileResponse[]) {
    let displayArray = [] as DisplayResponse[],
      i;
    for (i = 0; i < files.length; i++) {
      this.displayResponse.id = files[i].fileId;
      this.displayResponse.urlName = files[i].fileName;
      displayArray.push(this.displayResponse);
      this.displayResponse = {} as DisplayResponse;
    }
    return displayArray;
  }
  addFiles(files: Files[], albumName: string, link?: string) {
    let displayArray = [] as DisplayResponse[],
      i;
    link = `${link}${albumName}/`;
    this.setStatusForFolder(albumName);
    for (i = 0; i < files.length; i++) {
      this.displayResponse.id = files[i].id;
      this.displayResponse.urlName = link + files[i].fileName;
      displayArray.push(this.displayResponse);
      this.displayResponse = {} as DisplayResponse;
    }
    return displayArray;
  }
  getCommonFiles(result: Multimedia[], link: string) {
    let fileArray = [] as FileResponse[],
      i;
    for (i = 0; i < result.length; i++) {
      if (result[i].fileName != null && result[i].albumName == null) {
        this.fileResponse.fileId = result[i].id;
        this.fileResponse.fileName = link + result[i].fileName;
        fileArray.push(this.fileResponse);
        this.fileResponse = {} as FileResponse;
      }
    }
    return fileArray;
  }

  getDisplayFilesFromFolder(result: Multimedia[], link?: string) {
    let fileArray = [] as DisplayResponse[],
      i;
    for (i = 0; i < result.length; i++) {
      if (result[i].albumName != null && result[i].fileName == null) {
        return this.addFiles(result[i].files, result[i].albumName, link);
      }
    }
    return fileArray;
  }
  getFolderList(result: Multimedia[]) {
    let fileArray = [] as FolderResponse[],
      i;
    for (i = 0; i < result.length; i++) {
      if (result[i].albumName != null && result[i].fileName == null) {
        this.folderResponse.folderId = result[i].id;
        this.folderResponse.folderName = result[i].albumName;
        this.folderResponse.status = this.getStatusForFolder(result[i].albumName);
        fileArray.push(this.folderResponse);
        this.folderResponse = {} as FolderResponse;
      }
    }
    return fileArray;
  }

  flag: boolean = false;
  folderName: string = '';
  setStatusForFolder(albumName: string) {
    this.folderName = albumName;
    this.flag = true;
  }
  getStatusForFolder(albumName: string) {
    if (albumName == this.folderName) {
      return this.flag;
    } else {
      return false;
    }
  }

  /**
   * deleteImageById method will delete the images on basis of id
   */
  async deleteFileById(fileId: string, teamId: string): Promise<any> {
    const File = (await this.multimediaRepository.findOne(fileId)) as Multimedia;
    const filePath = `uploads/multimedia/${teamId}/` + File.albumName;
    console.log(filePath);
    const fileDeletedFromDB = await this.multimediaRepository.delete(fileId);
    if (fileDeletedFromDB) {
      return await this.fileStorageService.deleteFile(filePath);
    }
  }

  async deleteMultipleFiles(fileIds: string[]): Promise<any> {
    return await this.fileStorageService.deleteMultipleFiles(fileIds);
  }

  async deleteMultipleFolders(folderIds: string[]): Promise<any> {
    console.log('Folder Ids in service');
    console.log(folderIds);
    return await this.fileStorageService.deleteMultipleFolders(folderIds);
  }
  /**
   * getFilesForTeam method will fetch all images fot that team
   * @param {teamId} .Takes teamId as input
   * @return {FileResponse} FileResponse[] as response for that team
   */
  async getAllFilesInFolderForTeam(teamId: string, folderId: string): Promise<DisplayResponse[]> {
    let filesArray = [] as DisplayResponse[],
      i;
    const result = await this.multimediaRepository.find({ where: { team: teamId, id: folderId } });
    console.log(result);
    if (result == null) {
      return filesArray;
    }
    const link = `${this.globalLink}/${teamId}/${result[0].albumName}/`;
    for (i = 0; i < result[0].files.length; i++) {
      this.displayResponse.id = result[0].files[i].id;
      this.displayResponse.urlName = link + result[0].files[i].fileName;
      filesArray.push(this.displayResponse);
      this.displayResponse = {} as DisplayResponse;
    }
    return filesArray;
  }

  async getAllFilesForTeam(teamId: string): Promise<DisplayResponse[]> {
    let filesArray = [] as DisplayResponse[],
      i,
      j;
    const result = await this.multimediaRepository.find({ where: { team: teamId } });
    console.log(result);
    if (result == null) {
      return filesArray;
    }
    let link1 = `${this.globalLink}/${teamId}/`;
    for (i = 0; i < result.length; i++) {
      if (result[i].fileName == null) {
        let a = result[i];
        for (j = 0; j < a.files.length; j++) {
          let link2 = `${this.globalLink}/${teamId}/${a.albumName}/`;
          this.displayResponse.urlName = link2 + a.files[j].fileName;
          filesArray.push(this.displayResponse);
          this.displayResponse = {} as DisplayResponse;
        }
      } else {
        this.displayResponse.urlName = link1 + result[i].fileName;
        filesArray.push(this.displayResponse);
        this.displayResponse = {} as DisplayResponse;
      }
    }
    return filesArray;
  }
}
