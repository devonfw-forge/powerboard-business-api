import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { MultimediaCrudController } from './controllers/multimedia.crud.controller';
import { Multimedia } from './model/entities/multimedia.entity';
import { MultimediaCrudService } from './services/multimedia.crud.service';

@Module({
  imports: [TypeOrmModule.forFeature([Multimedia]), FileStorageModule],
  providers: [
    {
      provide: 'IMultimediaService',
      useClass: MultimediaCrudService,
    },
  ],
  controllers: [MultimediaCrudController],
  exports: ['IMultimediaService'],
})
export class MultimediaModule {}
