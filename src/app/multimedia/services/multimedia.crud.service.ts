import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
//import { isEmpty } from 'lodash';
import { Repository } from 'typeorm';
import { IFileStorageService } from '../../file-storage/services/file-storage.service.interface';
import { MultimediaResponse } from '../model/dto/MultimediaResponse';
import { Multimedia } from '../model/entities/multimedia.entity';
import { IMultimediaService } from './multimedia.crud.service.interface';

//const Thumbler = require('thumbler');

@Injectable()
export class MultimediaCrudService extends TypeOrmCrudService<Multimedia> implements IMultimediaService {
  constructor(
    @InjectRepository(Multimedia) private readonly multimediaRepository: Repository<Multimedia>, // @Inject(forwardRef(() => TeamCrudService)) // private teamService: TeamCrudService,
    @Inject('IFileStorageService') private readonly fileStorageService: IFileStorageService,
  ) {
    super(multimediaRepository);
  }
  videos = ['mp4', '3gp', 'ogg'];
  multimediaResponse: MultimediaResponse = {} as MultimediaResponse;
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
      multimedia.fileName = key[key.length - 1];
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

  /**
   * getPathOfImage method will fetch all images fot that team
   * @param {teamId} .Takes teamId as input
   * @return {TeamLinks} ImageResponse[] as response for that team
   */
  async getFilesForTeam(teamId: string): Promise<MultimediaResponse[]> {
    let imageArray = [] as MultimediaResponse[],
      i;
    const result = await this.multimediaRepository.find({ where: { team: teamId } });
    if (result == null) {
      return imageArray;
    }
    for (i = 0; i < result.length; i++) {
      this.multimediaResponse.fileId = result[i].id;
      this.multimediaResponse.fileName = result[i].fileName;
      imageArray.push(this.multimediaResponse);
      this.multimediaResponse = {} as MultimediaResponse;
    }
    return imageArray;
  }

  /**
   * deleteImageById method will delete the images on basis of id
   */
  async deleteFileById(fileId: string, teamId: string): Promise<any> {
    const File = (await this.multimediaRepository.findOne(fileId)) as Multimedia;
    const filePath = `uploads/multimedia/${teamId}/` + File.fileName;
    console.log(filePath);
    const fileDeletedFromDB = await this.multimediaRepository.delete(fileId);
    if (fileDeletedFromDB) {
      return await this.fileStorageService.deleteFile(filePath);
    }
  }
}
