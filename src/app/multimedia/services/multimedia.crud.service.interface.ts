import { DisplayResponse } from '../model/dto/DisplayResponse';
import { MultimediaResponse } from '../model/dto/MultimediaResponse';
import { Multimedia } from '../model/entities/multimedia.entity';

export interface IMultimediaService {
  getDefaultMultimediaForTeam(teamId: string): Promise<MultimediaResponse>;
  deleteFileById(teamId: string, fileId: string): Promise<any>;
  uploadFile(file: any, teamId: string): Promise<Multimedia>;
  getAllFilesInFolderForTeam(teamId: string, folderId: string): Promise<DisplayResponse[]>;
  uploadFileToFolder(teamId: string, folderId: string, file: any): Promise<Multimedia>;
  deleteMultipleFiles(fileIds: string[]): Promise<any>;
  deleteMultipleFolders(fileIds: string[]): Promise<any>;
  getAllFilesForTeam(teamId: string): Promise<DisplayResponse[]>;
}
