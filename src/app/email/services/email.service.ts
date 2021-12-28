import { IEmailService } from './email.service.interface';
import { AWSError, SES } from 'aws-sdk';
import * as dotenv from 'dotenv';
dotenv.config();
var Handlebars = require('handlebars');
// var fs = require('fs');
import { SendEmailResponse } from 'aws-sdk/clients/ses';
import { SendEmailDTO } from '../model/dto/SendEmail.dto';
import { IFileStorageService } from '../../file-storage/services/file-storage.service.interface';
import { Inject } from '@nestjs/common';

export class EmailService implements IEmailService {
  constructor(@Inject('IFileStorageService') private readonly fileStorageService: IFileStorageService) {}

  async sendTeamplateEmail(sendEmail: SendEmailDTO) {
    const emailHtml = await this.fileStorageService.getTemplate();
    const emailHtmlTemplate = emailHtml.toString('utf-8');
    console.log('***************************');
    console.log(emailHtmlTemplate);

    const template = Handlebars.compile(emailHtmlTemplate);
    const replacements = {
      username: sendEmail.username,
      defaultPassword: sendEmail.defaultPassword,
      // fullName: sendEmail.fullName
    };
    const htmlToSend = template(replacements);

    var params = {
      Destination: {
        ToAddresses: [sendEmail.toEmail],
      },
      Message: {
        Body: {
          // Text: {
          //     Data: bodyText,
          //     Charset: 'UTF-8'
          // },
          Html: {
            Data: htmlToSend,
          },
        },
        Subject: {
          Data: 'Welcome to Powerboard',
          Charset: 'UTF-8',
        },
      },
      Source: 'azhariiest@gmail.com',
    };
    //console.log(JSON.stringify(params, null, 4));
    const ses = this.getSES();
    return ses.sendEmail(params, (err: AWSError, data: SendEmailResponse) => {
      if (err) {
        console.log(err);
        console.log('Some Error occured while sending the mail to the recipient');
        return err;
      } else {
        console.log(data);
        return data;
      }
    });
  }

  getSES() {
    return new SES({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEFAULT_REGION,
    });
  }
}
