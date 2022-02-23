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
    const bucketS3 = process.env.AWS_BUCKET;
    const fileUploaded = await this.uploadS3(file.buffer, bucketS3, finalName);
    console.log('file has been uploaded');
    console.log(fileUploaded);
    return fileUploaded;
  }

  async uploadS3(file: any, bucket: any, filePath: any) {
    const s3 = this.getS3();
    const params = {
      Bucket: bucket,
      Key: String(filePath),
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
      Bucket: process.env.AWS_BUCKET as string,
      Key: filePath,
    };
    const s3 = this.getS3();
    s3.deleteObject(params, (error, data) => {
      if (error) {
        throw error;
      } else {
        console.log(data);
        console.log('File has been deleted successfully');
        return data;
      }
    });
  }

  async deleteMultipleFiles(filePaths: string[]) {
    var objects = [];
    for (var k in filePaths) {
      objects.push({ Key: filePaths[k] });
    }
    //   //const objects = filePaths.map(key => ({ Key: key }));
    const params = {
      Bucket: process.env.AWS_BUCKET as string,
      Delete: {
        Objects: objects,
      },
    };
    console.log('This is params in delete multiple files');
    console.log(params);
    const s3 = this.getS3();
    s3.deleteObjects(params, (error, data) => {
      if (error) {
        console.log('error occurred');
        throw error;
      } else {
        console.log('Deleted successfully');
        console.log(data);
        return data;
      }
    });
  }

  async deleteMultipleFolders(folderPaths: string[]) {
    console.log('jkrhjkwdssssssfwef');
    console.log(folderPaths);
    let k;
    for (k = 0; k < folderPaths.length; k++) {
      console.log(folderPaths[k]);
      var listParams = {
        Bucket: process.env.AWS_BUCKET as string,
        Prefix: folderPaths[k],
      };
      console.log(listParams);
      const s3 = this.getS3();
      s3.listObjects(listParams, function (err: any, data: any) {
        if (err) return err;

        if (data.Contents.length == 0) return;

        console.log('This is the data');
        console.log(data);
        // listParams = { Bucket: process.env.AWS_BUCKET as string };
        // listParams.Delete = { Objects: [] };
        var keys = [];
        for (var content of data.Contents) {
          keys.push({ Key: content.Key });
        }
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET as string,
          Delete: {
            Objects: keys,
          },
        };

        console.log('These are deleteParams');
        console.log(deleteParams);
        // data.Contents.forEach( (content: any)=>) {
        //   deleteParams.Delete.Objects.push({ Key: content.Key });
        // });
        s3.deleteObjects(deleteParams, (error, success) => {
          if (error) {
            console.log('error occurred');
            console.log(error);
            return error;
          }
          console.log('Deleted successfully');
          console.log(success);

          return success;
        });
      });
    }
  }

  async getTemplate(): Promise<any> {
    const filePath: string = 'new-user-email-template.html';
    const s3 = this.getS3();
    const getParams = {
      Bucket: process.env.AWS_ASSETS_BUCKET as string, // your bucket name,
      Key: filePath as string, // path to the object you're looking for
    };

    let { Body } = await s3.getObject(getParams).promise();
    return Body;
  }
}
