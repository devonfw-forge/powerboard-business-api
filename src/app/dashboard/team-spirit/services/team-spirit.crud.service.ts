import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../teams/model/entities/team.entity';
import { TeamSpiritResponse } from '../model/dto/TeamSpiritResponse.dto';
import { TeamSpiritMedian } from '../model/entities/team-spirit-median.entity';
import { TeamSpirit } from '../model/entities/team-spirit.entity';
import { ITeamSpiritService } from './team-spirit.interface';

@Injectable()
export class TeamSpiritCrudService extends TypeOrmCrudService<TeamSpiritMedian> implements ITeamSpiritService {
  constructor(
    @InjectRepository(TeamSpiritMedian) private readonly teamSpiritRepository: Repository<TeamSpiritMedian>,
    @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamSpirit) private readonly teamSpiritNameRepository: Repository<TeamSpirit>,
  ) // private readonly http: HttpService, // private readonly http: HttpService
  {
    super(teamSpiritRepository);
  }

  teamSpiritResponse: TeamSpiritResponse = {} as TeamSpiritResponse;
  accessTokenForTeamSpirit = '';

  /**
   * It will fetch an team spirit rating of a perticular team
   */
  async getTeamSpiritFromSurvey(team_id: string): Promise<TeamSpiritResponse | undefined> {
    const surveyResults: TeamSpiritMedian[] = (await this.teamSpiritRepository
      .createQueryBuilder('team_spirit_median')
      .where('team_spirit_median.team_id=:team_id', { team_id: team_id })
      .orderBy('team_spirit_median.end_date', 'DESC')
      .getMany()) as TeamSpiritMedian[];
    let teamSpiritResponse = {} as TeamSpiritResponse;
    if (surveyResults.length > 0) {
      let today: Date = new Date();
      for (let survey of surveyResults) {
        if (today > new Date(survey.endDate)) {
          teamSpiritResponse.teamSpiritRating = survey.surveyMedian;
          break;
        }
      }
    }
    const teamName = await this.getTeamSpiritTeamName(team_id);
    if(teamName){
      teamSpiritResponse.teamName = teamName;
    }
    if(teamSpiritResponse){
      return teamSpiritResponse;
    }
    return undefined;
  }

  async updateTeamSpiritName(teamId: string, teamSpiritName: string): Promise<string> {
    console.log('reached update team spirit name---------------------------');
    const team = await this.teamRepository.findOne(teamId);
    if (team) {
      console.log('Found team................................');
      let teamSpirit: TeamSpirit = (await this.teamSpiritNameRepository
        .createQueryBuilder('team_spirit')
        .where('team_spirit.team_id=:team_id', { team_id: teamId })
        .take(1)
        .getOne()) as TeamSpirit;
      console.log(teamSpirit);
      if (teamSpirit) {
        if (teamSpiritName != teamSpirit.teamName) {
          teamSpirit.teamName = teamSpiritName;
          const teamSpiritTeamName = await this.teamSpiritNameRepository.save(teamSpirit);
          if (teamSpiritTeamName) {
            // restart.....
            console.log('if exists--------------------');
            console.log(teamSpiritTeamName);
            return "restart";
          }
        }
        return teamSpirit.teamName;
      }
      console.log('else condition===============');
      let teamSpiritNew: TeamSpirit = new TeamSpirit();
      teamSpiritNew.teamName = teamSpiritName;
      teamSpiritNew.team = team;
      console.log(teamSpiritNew);
      const teamSpiritTeamName = await this.teamSpiritNameRepository.save(teamSpiritNew);
      if (teamSpiritTeamName) {
        // start.....
        console.log('new teamspirit====================');
        console.log(teamSpiritTeamName);
        return "start";
      }
      return teamSpiritName;
    } else {
      throw new NotFoundException('Team Not Found Exception');
    }
    return '';
  }

  async getTeamSpiritTeamName(teamId: string): Promise<string> {
    const teamSpirit: TeamSpirit = (await this.teamSpiritNameRepository
      .createQueryBuilder('team_spirit')
      .where('team_spirit.team_id=:team_id', { team_id: teamId })
      .take(1)
      .getOne()) as TeamSpirit;
    if (teamSpirit) {
      return teamSpirit.teamName;
    } else {
      return '';
    }
  }
}
