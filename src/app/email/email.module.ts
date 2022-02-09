import { Module } from '@nestjs/common';
import { CloudFileStorageService } from '../file-storage/services/cloud-file-storage.service';
import { EmailController } from './controller/email.controller';
import { EmailService } from './services/email.service';

@Module({
  imports: [],
  controllers: [EmailController],
  providers: [
    {
      provide: 'IFileStorageService',
      useClass: CloudFileStorageService,
    },
    {
      provide: 'IEmailService',
      useClass: EmailService,
    },
  ],
  exports: ['IEmailService', 'IFileStorageService'],
})
export class EmailModule { }
