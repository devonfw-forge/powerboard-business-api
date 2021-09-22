import { IFileStorageService } from './file-storage.service.interface';
import { v4 as uuidv4 } from 'uuid';
import { S3 } from 'aws-sdk';
import path = require('path');
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

export class CloudFileStorageService implements IFileStorageService {
  async uploadFile(file: any, filePath: string): Promise<any> {
    const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
    const extension: string = path.parse(file.originalname).ext;
    const name = `${filename}` + `${extension}`;
    const finalName: string = filePath + name;
    const bucketS3 = 'powerboard-test';
    return await this.uploadS3(file.buffer, bucketS3, finalName);
  }

  async uploadS3(file: any, bucket: any, name: any) {
    const s3 = this.getS3();
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, (err: any, data: any) => {
        if (err) {
          Logger.error(err);
          reject(err.message);
        }
        resolve(data);
      });
    });
  }

  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async deleteFile(filePath: string) {
    const params = {
      Bucket: 'powerboard-test',
      Key: filePath,
    };
    const s3 = this.getS3();
    s3.deleteObject(params, (error, data) => {
      if (error) {
        throw error;
      } else {
        console.log(data);
        //console.log('File has been deleted successfully');
        return data;
      }
    });
  }
}

// async uploadFile(file: any, originalPath: string): Promise<any> {
//   if (!fs.existsSync(originalPath)) {
//     fs.mkdirSync(originalPath, {
//       recursive: true,
//     });
//   }
// const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
// const extension: string = path.parse(file.originalname).ext;
// const name = `${filename}` + `${extension}`;
//   const filePath: string = originalPath + name;
//   let fileStream = createWriteStream(filePath);
//   fileStream.write(file.buffer);
//   fileStream.end();
//   return name;
// }
