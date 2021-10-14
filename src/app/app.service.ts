import { Injectable } from '@nestjs/common';


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  // @Cron('* * * 10 * *')
  // async handleCron() {
  //   console.log('aa jao jira ')
  //  const result = await ('https://jsonplaceholder.typicode.com/todos/1')
  // //  .then(response => response.json())
  // //   .then(json => console.log(json))
  // }
  //}
}
