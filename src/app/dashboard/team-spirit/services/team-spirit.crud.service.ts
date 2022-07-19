import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { TeamSpiritResponse } from '../model/dto/TeamSpiritResponse.dto';
import { TeamSpiritMedian } from '../model/entities/team-spirit-median.entity';
import { ITeamSpiritService } from './team-spirit.interface';

@Injectable()
export class TeamSpiritCrudService extends TypeOrmCrudService<TeamSpiritMedian> implements ITeamSpiritService {
  constructor(
    @InjectRepository(TeamSpiritMedian) private readonly teamSpiritRepository: Repository<TeamSpiritMedian>, //@InjectRepository(Team) private readonly teamRepository: Repository<Team>, // private readonly http: HttpService, // private readonly http: HttpService
  ) {
    super(teamSpiritRepository);
  }
  teamSpiritResponse: TeamSpiritResponse = {} as TeamSpiritResponse;
  accessTokenForTeamSpirit = '';

  /**
   * It will fetch an team spirit rating of a perticular team
   */
  async getTeamSpiritFromSurvey(teamName: string): Promise<TeamSpiritResponse | null> {
    const surveyResult: TeamSpiritMedian = (await this.teamSpiritRepository
      .createQueryBuilder('team_spirit_median')
      .where('team_spirit_median.team_name=:team_name', { team_name: teamName })
      .orderBy('team_spirit_median.start_date', 'DESC')
      .limit(1)
      .getOne()) as TeamSpiritMedian;
    let teamSpiritResponse = {} as TeamSpiritResponse;
    if (surveyResult) {
      teamSpiritResponse.teamSpiritRating = surveyResult.surveyMedian;
      return teamSpiritResponse;
    } else {
      return null;
    }
  }
}
