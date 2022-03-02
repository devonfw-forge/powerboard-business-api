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
  async getClientFeedback(team_Id: string): Promise<ClientStatusResponse | undefined> {
    const sprint = (await this.sprintRepository
      .createQueryBuilder('sprint')
      .where('sprint.team_id=:team_id', { team_id: team_Id })
      .orderBy('sprint.sprint_number', 'DESC')
      .skip(1)
      .take(1)
      .getOne()) as Sprint;
    if (sprint == null) {
      return undefined;
    }

    const clientStatus = (await this.clientRepository
      .createQueryBuilder('client_status')
      .where('client_status.sprintId=:sprintId', { sprintId: sprint.id })
      .limit(1)
      .getOne()) as ClientStatus;
    if (clientStatus == null) {
      return undefined;
    } else {
      this.clientStatus.clientSatisfactionRating = clientStatus.client_rating;
      this.clientStatus.sprintNumber = sprint.sprint_number;
      return this.clientStatus;
    }
  }
}
