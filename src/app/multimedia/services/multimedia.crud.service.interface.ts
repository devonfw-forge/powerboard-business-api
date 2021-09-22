import { MultimediaResponse } from '../model/dto/MultimediaResponse';
import { Multimedia } from '../model/entities/multimedia.entity';

export interface IMultimediaService {
  getFilesForTeam(teamId: string): Promise<MultimediaResponse[]>;
  deleteFileById(teamId: string, fileId: string): Promise<any>;
  uploadFile(file: any, teamId: string): Promise<Multimedia>;
}
