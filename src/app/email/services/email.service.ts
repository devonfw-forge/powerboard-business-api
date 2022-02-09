import { IEmailService } from './email.service.interface';
import { AWSError, SES } from 'aws-sdk';
import * as dotenv from 'dotenv';
dotenv.config();
var Handlebars = require('handlebars');
//var fs = require('fs');
import { SendEmailResponse } from 'aws-sdk/clients/ses';
import { SendEmailDTO } from '../model/dto/SendEmail.dto';
import { Inject } from '@nestjs/common';
import { IFileStorageService } from '../../file-storage/services/file-storage.service.interface';

export class EmailService implements IEmailService {
  constructor(
    @Inject('IFileStorageService') private readonly fileStorageService: IFileStorageService
  ) { }


  async sendTeamplateEmail(sendEmail: SendEmailDTO) {

    let emailHtmlTemplate = await this.fileStorageService.getTemplate();

    console.log('***************************');

    console.log(emailHtmlTemplate);

    const template = Handlebars.compile(emailHtmlTemplate);

    const replacements = {

      username: sendEmail.username,

      defaultPassword: sendEmail.defaultPassword,

    };

    const htmlToSend = template(replacements);

    var params = {

      Destination: {

        ToAddresses: [sendEmail.toEmail],

      },

      Message: {

        Body: {

          Html: {

            Data: htmlToSend,

          },

        },

        Subject: {

          Data: 'Welcome to Powerboard',

          Charset: 'UTF-8',

        },

      },

      Source: 'azhariiest@gmail.com',

    };

    const ses = this.getSES();

    return ses.sendEmail(params, (err: AWSError, data: SendEmailResponse) => {

      if (err) {

        console.log(err);

        console.log('Some Error occured while sending the mail to the recipient');

        return err;

      } else {

        console.log(data);

        return data;

      }

    });
  }

  // async sendTeamplateEmail(sendEmail: SendEmailDTO) {
  //   const x = await this.fileStorageService.getTemplate();
  //   console.log("####################################")
  //   console.log(x);
  //   fs.readFile(
  //     'src/app/templates/new-user-email.template.html',
  //     { encoding: 'utf-8' },
  //     (err: any, emailHtmlTemplate: any) => {
  //       if (err) {
  //         console.log(err);
  //         throw err;
  //       }

  //       const template = Handlebars.compile(emailHtmlTemplate);
  //       const replacements = {
  //         username: sendEmail.username,
  //         defaultPassword: sendEmail.defaultPassword,
  //         // fullName: sendEmail.fullName
  //       };
  //       const htmlToSend = template(replacements);

  //       var params = {
  //         Destination: {
  //           ToAddresses: [sendEmail.toEmail],
  //         },
  //         Message: {
  //           Body: {
  //             // Text: {
  //             //     Data: bodyText,
  //             //     Charset: 'UTF-8'
  //             // },
  //             Html: {
  //               Data: htmlToSend,
  //             },
  //           },
  //           Subject: {
  //             Data: 'Welcome to Powerboard',
  //             Charset: 'UTF-8',
  //           },
  //         },
  //         Source: 'azhariiest@gmail.com',
  //       };
  //       console.log(JSON.stringify(params, null, 4));
  //       const ses = this.getSES();
  //       return ses.sendEmail(params, (err: AWSError, data: SendEmailResponse) => {
  //         if (err) {
  //           console.log(err, err.stack);
  //           return err;
  //         } else {
  //           console.log(data);
  //           return data;
  //         }
  //       });
  //     },
  //   );
  // }

  getSES() {
    return new SES({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEFAULT_REGION,
    });
  }
}
