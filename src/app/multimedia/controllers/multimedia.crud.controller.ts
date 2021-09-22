import { Controller, Delete, Get, Inject, Param, Post, Response, UploadedFile, UseInterceptors } from '@nestjs/common';
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

  @Get('getAllFiles/:teamId')
  //@UseGuards(AuthGuard('jwt'))
  async getAllFiles(@Param('teamId') teamId: string, @Response() res: eResponse): Promise<void> {
    const result = await this.multimediaService.getFilesForTeam(teamId);
    res.status(200).json(result);
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
}
