import { Module } from '@nestjs/common';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { EmailController } from './controller/email.controller';
import { EmailService } from './services/email.service';

@Module({
  imports: [FileStorageModule],
  controllers: [EmailController],
  providers: [
    {
      provide: 'IEmailService',
      useClass: EmailService,
    },
  ],
  exports: ['IEmailService'],
})
export class EmailModule {}
