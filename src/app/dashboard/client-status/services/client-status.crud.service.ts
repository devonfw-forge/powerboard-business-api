import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Sprint } from '../../sprint/model/entities/sprint.entity';
import { Repository } from 'typeorm';
import { ClientStatusResponse } from '../model/dto/ClientStatusResponse';
import { ClientStatus } from '../model/entities/client-status.entity';

@Injectable()
export class ClientStatusCrudService extends TypeOrmCrudService<ClientStatus> {
  constructor(
    @InjectRepository(ClientStatus) private readonly clientRepository: Repository<ClientStatus>,
    @InjectRepository(Sprint) private readonly sprintRepository: Repository<Sprint>,
  ) {
    super(clientRepository);
  }

  clientStatus: ClientStatusResponse = {} as ClientStatusResponse;

  /**
   * It will fetch the client's satisfaction rating from db for a particular team in a particular sprint
   * and returns it back
   */
  async getClientFeedback(team_Id: string): Promise<ClientStatusResponse | null> {
    let selectedSprintId: string = '';
    let selectedSprintNumber: number = 0;

    const activeSprints: any = (await this.sprintRepository
      .createQueryBuilder('sprint')
      .where('sprint.team_id =:team_Id', { team_Id: team_Id })
      .orderBy('sprint.end_date', 'DESC')
      .getRawMany()) as Sprint[];
    console.log('$$$$$$$$$$$$  these are list of sprints   $$$$$$');
    console.log(activeSprints);
    if (activeSprints) {
      let sprintFound: boolean = false;
      let date = new Date();
      for (let sprint of activeSprints) {
        if (date > sprint.sprint_end_date) {
          selectedSprintId = sprint.sprint_id;
          selectedSprintNumber = sprint.sprint_sprint_number;
          sprintFound = true;
          break;
        }
      }
      if (!sprintFound) {
        return null;
      }
    } else {
      return null;
    }

    const clientStatus = (await this.clientRepository
      .createQueryBuilder('client_status')
      .where('client_status.sprintId=:sprintId', { sprintId: selectedSprintId })
      .limit(1)
      .getOne()) as ClientStatus;
    if (clientStatus == null) {
      return null;
    } else {
      this.clientStatus.clientSatisfactionRating = clientStatus.client_rating;
      this.clientStatus.sprintNumber = selectedSprintNumber;
      return this.clientStatus;
    }
  }
}
