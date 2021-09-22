import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Response,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { CrudType } from '@devon4node/common/serializer';
import { Response as eResponse } from 'express';
import { Multimedia } from '../model/entities/multimedia.entity';
import { IMultimediaService } from '../services/multimedia.crud.service.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Crud({
  model: {
    type: Multimedia,
  },
})
@CrudType(Multimedia)
@Controller('multimedia')
export class MultimediaCrudController {
  constructor(@Inject('IMultimediaService') public multimediaService: IMultimediaService) {}

  @Post('uploadFile/:teamId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: any,
    @Param('teamId') teamId: string,
    @Response() res: eResponse,
  ): Promise<void> {
    const result = await this.multimediaService.uploadFile(file, teamId);
    res.status(201).json(result);
  }

  @Post('uploadFileToFolder/:albumId/:teamId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileToFolder(
    @UploadedFile() file: any,
    @Param('teamId') teamId: string,
    @Param('albumId') albumId: string,
    @Response() res: eResponse,
  ): Promise<void> {
    const result = await this.multimediaService.uploadFileToFolder(teamId, albumId, file);
    res.status(201).json(result);
  }

  @Get('getDefaultView/:teamId')
  //@UseGuards(AuthGuard('jwt'))
  async getAllAlbums(@Param('teamId') teamId: string, @Response() res: eResponse): Promise<void> {
    const result = await this.multimediaService.getDefaultMultimediaForTeam(teamId);
    res.status(200).json(result);
  }

  @Get('getAllFilesInFolder/:teamId/:folderId')
  //@UseGuards(AuthGuard('jwt'))
  async getAllFilesInFolderForTeam(
    @Param('teamId') teamId: string,
    @Param('folderId') folderId: string,
    @Response() res: eResponse,
  ): Promise<void> {
    const result = await this.multimediaService.getAllFilesInFolderForTeam(teamId, folderId);
    res.status(200).json(result);
  }

  @Delete('/deleteFiles')
  async deleteMultipleFiles(@Body() fileIds: string[]): Promise<any> {
    console.log('These are file Ids');
    console.log(fileIds);
    return await this.multimediaService.deleteMultipleFiles(fileIds);
  }
  @Delete('/deleteFolders')
  async deleteMultipleFolders(@Body() folderIds: string[]): Promise<any> {
    console.log('These are folder Ids');
    console.log(folderIds);
    return await this.multimediaService.deleteMultipleFolders(folderIds);
  }

  @Delete('deleteFile/:teamId/:fileId')
  //@UseGuards(AuthGuard('jwt'))
  async deleteFileById(
    @Param('fileId') fileId: string,
    @Param('teamId') teamId: string,
    @Response() res: eResponse,
  ): Promise<void> {
    console.log('This is file Id');
    console.log(fileId);
    const result = await this.multimediaService.deleteFileById(fileId, teamId);
    console.log(result);
    res.status(200).json({ message: 'File successfully Deleted' });
  }

  @Get('getAllFilesForTeam/:teamId')
  //@UseGuards(AuthGuard('jwt'))
  async getAllFilesForTeam(@Param('teamId') teamId: string, @Response() res: eResponse): Promise<any> {
    const result = await this.multimediaService.getAllFilesForTeam(teamId);
    res.status(200).json(result);
  }
}
