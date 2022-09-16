import { Inject, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Team } from '../model/entities/team.entity';
import { PowerboardResponse } from '../model/dto/PowerboardResponse';
import { UserTeamDTO } from '../model/dto/UserTeamDTO';
import { MyCenter } from '../model/dto/MyCenter';
import { TeamLinkResponse } from '../../team-links/model/dto/TeamLinkResponse';
import { UpdateTeam } from '../model/dto/updateTeam.interface';
import { ADCenter } from '../../ad-center/model/entities/ad-center.entity';
import { IDashboardService } from '../../dashboard/services/dashboard.service.interface';
import { ITeamLinksservice } from '../../team-links/services/team-links.service.interface';
import { MultimediaResponse } from '../../multimedia/model/dto/MultimediaResponse';
import { IMultimediaService } from '../../multimedia/services/multimedia.crud.service.interface';
import { IUserTeamService } from '../../core/user/services/user-team.service.interface';
import { IUserPrivilegeService } from '../../core/user/services/user-privilege.service.inteface';
import { ITeamService } from './team.service.interface';
import { IGlobalTeamsService } from './global.team.service.interface';
import * as dotenv from 'dotenv';
import { ITeamSpiritService } from '../../dashboard/team-spirit/services/team-spirit.interface';
dotenv.config();
@Injectable()
export class TeamCrudService extends TypeOrmCrudService<Team> implements ITeamService {
  constructor(
    @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
    @InjectRepository(ADCenter) readonly centerRepository: Repository<ADCenter>,

    @Inject('IDashboardService') private readonly dashboardService: IDashboardService,
    @Inject('ITeamLinksService') private readonly teamLinkService: ITeamLinksservice,
    @Inject('IMultimediaService') private readonly multimediaService: IMultimediaService,
    @Inject('IUserTeamService') private readonly userTeamService: IUserTeamService,
    @Inject('IUserPrivilegeService') private readonly userPrivilegeService: IUserPrivilegeService,
    @Inject('IGlobalTeamService') private readonly globalTeamService: IGlobalTeamsService,
    @Inject('ITeamSpiritService') private readonly teamSpiritService: ITeamSpiritService,
  ) {
    super(teamRepository);
  }
  globalLink = process.env.AWS_URL + 'logo';
  powerboardResponse: PowerboardResponse = {} as PowerboardResponse;

  /**
   * It will fetch all the details of team
   * i.e All the KPI's, links, multimedia, and
   * if team not found then will throw an exception.
   */
  async getTeamInfoById(userTeam: UserTeamDTO): Promise<PowerboardResponse> {
    const teamId = userTeam.teamId;
    const userId = userTeam.userId;

    const teams = await this.globalTeamService.findTeamById(teamId);

    if (!teams) {
      throw new NotFoundException('Team Not Found');
    }
    let isSystemAdmin, privilegeList: string[] | undefined;

    if (userId) {
      isSystemAdmin = await this.userTeamService.isSystemAdmin(userId);
      privilegeList = await this.userPrivilegeService.getUserPrivilegeForTeam(userId, teamId, isSystemAdmin);
    }
    this.powerboardResponse.team_id = teams.id;
    this.powerboardResponse.team_name = teams.name;
    this.powerboardResponse.project_key = teams.projectKey;
    this.powerboardResponse.center = teams.ad_center.name;
    this.powerboardResponse.team_code = teams.teamCode;
    if (teams.logo == null) {
      this.powerboardResponse.logo = null;
    } else {
      this.powerboardResponse.logo = `${this.globalLink}/${teamId}/` + teams.logo;
    }

    this.powerboardResponse.dashboard = await this.dashboardService.getDashboardByTeamId(teams);
    this.powerboardResponse.teamLinks = await this.getLinksForTeam(teams.id, privilegeList);
    this.powerboardResponse.aggregationLinks = await this.getAggregationLinksForTeam(teams.id);
    this.powerboardResponse.multimedia = await this.getMultimediaForTeam(teams.id);

    if (isSystemAdmin) {
      this.powerboardResponse.privileges = [];
      this.powerboardResponse.isTeamConfigured = true;
    } else {
      const isTeamAdmin = await this.userTeamService.isTeamAdmin(userId, teamId);
      if (isTeamAdmin && !teams.isTeamConfigured) {
        this.powerboardResponse.isTeamConfigured = false;
      } else {
        this.powerboardResponse.isTeamConfigured = true;
      }
      this.powerboardResponse.privileges = privilegeList!;
    }
    return this.powerboardResponse;
  }

  /**
   * It will fetch all the links associated with team.
   */
  async getLinksForTeam(teamId: string, privilegeList?: string[]): Promise<any> {
    if (privilegeList?.includes('view_links')) {
      const teamLink: TeamLinkResponse[] = await this.teamLinkService.getTeamLinks(teamId);
      return teamLink;
    } else {
      return [];
    }
  }

  /**
   * It will fetch all the aggregation links associated with team.
   */
  async getAggregationLinksForTeam(teamId: string): Promise<any> {
    const aggregationLinks: any = await this.teamLinkService.getAggregationLinks(teamId);
    if (aggregationLinks) {
      return aggregationLinks;
    } else {
      return [];
    }
  }

  /**
   * It will fetch all the multimedia associated with team.
   */
  async getMultimediaForTeam(teamId: string): Promise<MultimediaResponse> {
    const multimedia: MultimediaResponse = await this.multimediaService.getDefaultMultimediaForTeam(teamId);
    return multimedia;
  }

  /**
   * It will update details like name, projectKey, teamcode in team, and
   * if team not found then will throw an exception.
   */
  async updateTeam(updateTeam: UpdateTeam, teamId: string): Promise<any> {
    let error: string="";
    console.log("reached update team service=====================");
    console.log(updateTeam);
    const teamExisted: Team = (await this.teamRepository.findOne(teamId)) as Team;
    if (!teamExisted) {
      throw new NotFoundException('Team Not Found');
    }
    try{
      teamExisted.name = updateTeam.teamName;
      teamExisted.projectKey = updateTeam.projectKey;
      teamExisted.teamCode = updateTeam.teamCode;
      console.log("update team method");
      await this.teamRepository.save(teamExisted);
      error = ",";
    }
    catch(E){
      error="Unable to update Team,";
    }
    try{
      const teamSpirit = await this.globalTeamService.checkTeamSpiritTeamName(updateTeam.teamSpiritTeamName);
      if(teamSpirit){
        const data = await this.teamSpiritService.updateTeamSpiritName(teamId, updateTeam.teamSpiritTeamName);
        if(data){
          if(data == "restart"){
            this.globalTeamService.restartTeamSpiritScheduler(teamId);
          }
          if(data == "start"){
            this.globalTeamService.triggerTeamSpiritScheduler(teamId);
          }
        }
      }
      error=error+"";
    }
    catch(E){
      error = error+"Team Name not found in Team Spirit application";
    }
    if(error.length>1){
      throw new NotImplementedException(error);
    }
    return "Team Updated Successfully";
  }

  /**
   * It will fetch ADCenter according to team.
   */
  async getCenterByTeamId(teamId: string): Promise<MyCenter> {
    const result = await this.teamRepository.findOne({ where: { id: teamId } });
    let myCenter: MyCenter = {} as MyCenter;
    myCenter.centerId = result?.ad_center.id!;
    myCenter.centerName = result?.ad_center.name!;
    return myCenter;
  }
}
