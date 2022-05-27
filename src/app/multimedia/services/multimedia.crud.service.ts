import { Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
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
import { DeleteResponse } from '../model/dto/DeleteResponse.interface';

dotenv.config();
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
  globalLink = process.env.AWS_URL + 'multimedia';
  rootFiles: Multimedia[] = [];

  /**
   * It creates the path consisting of team id and upload the file to that path in the AWS bucket
   *  with the help of uploadFile method and then save the file in the db
   */
  async uploadFile(file: any, teamId: string): Promise<any> {
    let multimedia = new Multimedia();
    const originalPath = `uploads/uploads/multimedia/${teamId}/`;
    const output = await this.fileStorageService.uploadFile(file, originalPath);
    console.log('This is output');
    console.log(output);

    if (output) {
      const key = output.Key.split('/');
      multimedia.fileName = key[key.length - 1];
      multimedia.team = teamId;
      console.log(multimedia);
      console.log(multimedia.team);
      const result = await this.multimediaRepository.save(multimedia);
      result.fileName = `${this.globalLink}/${teamId}/${result.fileName}`;
      return result;
    }
  }

  /**
   *  It first fetches the multimedia present in the db with the album Id and attaches the album name
   *  of the multimedia to the path where the file has to be uploaded and with the help of uploadFile
   * method it uploads the file to that path (folder path) in AWS S3 bucket. Finally persist the file in the file
   * repository
   */

  /**
   * It uploads a file to a particular folder in the AWS S3 bucket. It creates the path by attaching the
   * album name and then uploads the file to that path and persist it in the file repository.
   */
  async uploadFileToFolder(teamId: string, albumId: string, file: any): Promise<any> {
    const multimedia = (await this.multimediaRepository.findOne({ where: { id: albumId } })) as Multimedia;
    console.log(multimedia);
    const albumName = multimedia.albumName;
    let fileEntry = new Files();
    const originalPath = `uploads/uploads/multimedia/${teamId}/${albumName}/`;
    const fileUploaded = await this.fileStorageService.uploadFile(file, originalPath);
    if (fileUploaded) {
      const key = fileUploaded.Key.split('/');
      fileEntry.fileName = key[key.length - 1];
      fileEntry.album = multimedia.id;
      const fileSaved = await this.filesRepository.save(fileEntry);
      fileSaved.fileName = `${this.globalLink}/${teamId}/${albumName}/${fileSaved.fileName}`;
      return fileSaved;
    }
  }

  /**
   * It returns the default multimedia for a team at root level. If default multimedia is file then returns files
   * and if default multimedia is a folder then returns the files inside that folder as default multimedia response
   */
  async getDefaultMultimediaForTeam(teamId: string): Promise<MultimediaResponse> {
    this.rootFiles = [];
    const link = `${this.globalLink}/${teamId}/`;
    const result = await this.multimediaRepository.find({
      where: { team: teamId },
      order: {
        albumName: 'ASC',
      },
    });
    console.log('==================this is multimedia repo response==============');
    console.log(result);
    if (result == null) {
      throw new NotFoundException('No multimedia found');
    } else {
      let rootFiles = this.getCommonFiles(result, link);
      console.log('88888888888888888888888Below is home file 8888888888');
      console.log(rootFiles);
      if (rootFiles.length != 0) {
        this.multimediaResponse.display = this.getDisplay(rootFiles);
      } else {
        this.multimediaResponse.display = this.getDisplayFilesFromFolder(result, link);
      }
      this.multimediaResponse.root = this.getFolderList(result);
      console.log('multimedia response');
      console.log(this.multimediaResponse);
      return this.multimediaResponse;
    }
  }

  /**
   * It creates the display response out of the files coming as input and returns it
   */
  getDisplay(files: FileResponse[]) {
    let displayArray = [] as DisplayResponse[],
      i;
    for (i = 0; i < files.length; i++) {
      this.displayResponse.id = files[i].fileId;
      this.displayResponse.urlName = files[i].fileName;
      this.displayResponse.inSlideShow = files[i].inSlideShow;
      displayArray.push(this.displayResponse);
      this.displayResponse = {} as DisplayResponse;
    }
    return displayArray;
  }

  /**
   * It will add multimedia files into Slide Show
   */
  addFiles(files: Files[], albumName: string, inSlideShow: boolean, link?: string) {
    console.log('add filleeessss');
    let displayArray = [] as DisplayResponse[],
      i;
    link = `${link}${albumName}/`;
    this.setStatusForFolder(albumName);
    for (i = 0; i < files.length; i++) {
      this.displayResponse.id = files[i].id;
      this.displayResponse.urlName = link + files[i].fileName;
      this.displayResponse.inSlideShow = inSlideShow;
      displayArray.push(this.displayResponse);
      this.displayResponse = {} as DisplayResponse;
    }
    console.log('display Arrraaayyyy');
    console.log(displayArray);
    return displayArray;
  }

  /**
   * It creates the file response out of all the multimedia coming as input and returns
   * the file response
   */
  getCommonFiles(result: Multimedia[], link: string) {
    let fileArray = [] as FileResponse[],
      i;
    for (i = 0; i < result.length; i++) {
      if (result[i].fileName != null && result[i].albumName == null) {
        this.fileResponse.fileId = result[i].id;
        this.fileResponse.fileName = link + result[i].fileName;
        this.fileResponse.inSlideShow = result[i].inSlideshow;
        fileArray.push(this.fileResponse);
        this.rootFiles.push(result[i]);
        this.fileResponse = {} as FileResponse;
      }
    }
    return fileArray;
  }

  /**
   * It will fetch all the files in folder.
   */
  getDisplayFilesFromFolder(result: Multimedia[], link?: string) {
    let fileArray = [] as DisplayResponse[],
      i;
    for (i = 0; i < result.length; i++) {
      if (result[i].albumName != null && result[i].fileName == null && result[i].files.length != 0) {
        return this.addFiles(result[i].files, result[i].albumName, result[i].inSlideshow, link);
      }
    }
    return fileArray;
  }

  /**
   * It creates list of all the folders out of multimedia coming as input and then returns the corresponding
   * folder response
   */
  getFolderList(result: Multimedia[]) {
    let fileArray = [] as FolderResponse[],
      i;
    for (i = 0; i < result.length; i++) {
      if (result[i].albumName != null && result[i].fileName == null) {
        this.folderResponse.folderId = result[i].id;
        this.folderResponse.folderName = result[i].albumName;
        this.folderResponse.inSlideShow = result[i].inSlideshow;
        this.folderResponse.status = this.getStatusForFolder(result[i].albumName);
        console.log('Huhuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu');
        console.log(this.folderResponse.status);
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
    if (this.rootFiles.length != 0) {
      return false;
    }
    if (this.folderName == albumName) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * It will delete selected files inside sub folder from DB as well as S3 bucket.
   */
  async deleteFilesFromSubFolder(teamId: string, subFolderId: string, filesId: string[]) {
    let filesPath: string[] = [];
    const subFolder = await this.multimediaRepository.findOne(subFolderId);

    const commanPath = 'uploads/uploads/multimedia/' + teamId + '/' + subFolder?.albumName + '/';

    for (let id of filesId) {
      const file = (await this.filesRepository.findOne(id)) as Files;
      filesPath.push(commanPath + file.fileName);
    }
    console.log(filesPath);

    const fileDeletedFromDB = await this.filesRepository.delete(filesId);

    if (fileDeletedFromDB) {
      if (filesPath.length > 0) {
        return this.fileStorageService.deleteMultipleFiles(filesPath);
      }
    }
  }

  /**
   * It will delete files & folders in root from DB as well as S3 bucket.
   */
  async deleteFilesAndFoldersFromRoot(teamId: string, filesId: string[], foldersId: string[]) {
    const commanPath = 'uploads/uploads/multimedia/' + teamId + '/';

    let foldersPath: string[] = [];
    let filesPath: string[] = [];

    for (let folderId of foldersId) {
      const folder = (await this.multimediaRepository.findOne(folderId)) as Multimedia;
      foldersPath.push(commanPath + folder.albumName);
    }

    for (let fileId of filesId) {
      const file = (await this.multimediaRepository.findOne(fileId)) as Multimedia;
      filesPath.push(commanPath + file.fileName);
    }
    const finalList = filesId.concat(foldersId);
    const fileDeletedFromDB = await this.multimediaRepository.delete(finalList);
    if (fileDeletedFromDB) {
      let folderSuccess;
      let fileSuccess;

      if (foldersPath.length > 0) {
        folderSuccess = await this.fileStorageService.deleteMultipleFolders(foldersPath);
      }
      if (filesPath.length > 0) {
        fileSuccess = await this.fileStorageService.deleteMultipleFiles(filesPath);
      }
      if (folderSuccess && fileSuccess) {
        return folderSuccess;
      }
    }
  }

  /**
   * It will delete multiple files & folders from root as well as subFolder
   */
  async deleteMultipleFilesAndFolders(teamId: string, deleteResponse: DeleteResponse): Promise<any> {
    if (deleteResponse.subFolderId === null) {
      console.log('delete files from root');
      console.log(deleteResponse);
      return this.deleteFilesAndFoldersFromRoot(teamId, deleteResponse.filesId, deleteResponse.foldersId);
    } else {
      console.log('delete files from sub folder');
      console.log(deleteResponse);
      return this.deleteFilesFromSubFolder(teamId, deleteResponse.subFolderId, deleteResponse.filesId);
    }
  }

  /**
   * It creates a new multimedia folder for a particular team and then persisit it in the db
   */
  async addFolder(teamId: string, folderName: string): Promise<Multimedia> {
    if (folderName === '') {
      throw new NotAcceptableException();
    }
    folderName = folderName.toLowerCase();
    let multimediaOBJ = new Multimedia();
    multimediaOBJ.albumName = folderName;
    multimediaOBJ.team = teamId;
    const result = await this.multimediaRepository.save(multimediaOBJ);

    console.log(result);
    return result;
  }

  /**
   * It fetches all the files present in a particular folder for a team and returns them in the
   * form of display response
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
  /**
   * It checks files without folder and also files with folder for a team and then returns them all in
   * display response
   */
  async getAllFilesForTeam(teamId: string): Promise<DisplayResponse[]> {
    let filesArray = [] as DisplayResponse[],
      i,
      j;
    const result = await this.multimediaRepository.find({ where: { team: teamId } });
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

  /**
   * It will add selected files & folders into slide show.
   */
  async addFilesAndFoldersIntoSlideshow(teamId: string, fileAndFolderIds: string[]): Promise<Multimedia[]> {
    let finalMultimediaList: Multimedia[] = [];
    let resetMultimedia = await this.multimediaRepository.find({
      where: { team: teamId },
    });
    for (let eachMultimedia of resetMultimedia) {
      eachMultimedia.inSlideshow = false;
    }
    let multimedia = await this.multimediaRepository.save(resetMultimedia);
    console.log(multimedia);
    for (let eachMultimedia of multimedia) {
      if (fileAndFolderIds.includes(eachMultimedia.id)) {
        eachMultimedia.inSlideshow = true;
        finalMultimediaList.push(eachMultimedia);
      }
    }

    return this.multimediaRepository.save(finalMultimediaList);
  }

  /**
   * It will fetch all the multimedia files which is available for slide show.
   */
  async getMultimediaForSlideshow(teamId: string): Promise<any> {
    let result: { fileURL: string }[] = [];
    const commanPath =
      'https://powerboard-test.s3.eu-central-1.amazonaws.com/uploads/uploads/multimedia/' + teamId + '/';

    let multimedia = await this.multimediaRepository.find({ where: { team: teamId, inSlideshow: true } });

    for (let eachMultimedia of multimedia) {
      if (eachMultimedia.albumName === null) {
        result.push({ fileURL: commanPath + eachMultimedia.fileName });
      } else {
        for (let file of eachMultimedia.files) {
          result.push({ fileURL: commanPath + eachMultimedia.albumName + '/' + file.fileName });
        }
      }
    }
    return result;
  }
}
