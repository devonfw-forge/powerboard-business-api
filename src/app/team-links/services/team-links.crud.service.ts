import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../teams/model/entities/team.entity';
import { AggregationLinkDTO } from '../model/dto/aggregationLinkDTO';
import { AggregationLinkResponse } from '../model/dto/AggregationLinkResponse';
import { AggregationLinksCategoryResponse } from '../model/dto/AggregationLinksCategoryResponse';
import { LinksCategoryResponse } from '../model/dto/LinksCategoryResponse';
import { TeamLinkDTO } from '../model/dto/TeamLinkDTO';
import { TeamLinkResponse } from '../model/dto/TeamLinkResponse';
import { AggregationLinksCategory } from '../model/entities/aggregation_links_category.entity';
import { LinksCategory } from '../model/entities/link-category.entity';
import { TeamLinks } from '../model/entities/team-links.entity';
import { SchedulerConfig } from '../model/entities/third_party_median.entity';
import { ITeamLinksservice } from './team-links.service.interface';

@Injectable()
export class TeamLinksCrudService extends TypeOrmCrudService<TeamLinks> implements ITeamLinksservice {
  constructor(
    @InjectRepository(Team) private readonly teamRespository: Repository<Team>,
    @InjectRepository(TeamLinks) private readonly teamLinkRepository: Repository<TeamLinks>,
    @InjectRepository(LinksCategory) private readonly linkCategoryRepository: Repository<LinksCategory>,
    @InjectRepository(AggregationLinksCategory)
    private readonly aggregationLinksCategoryRepository: Repository<AggregationLinksCategory>,
    @InjectRepository(SchedulerConfig) private readonly schedulerConfigRepository: Repository<SchedulerConfig>,
  ) {
    super(teamLinkRepository);
  }

  /**
   * It will fetch all the links associated with team.
   */
  teamLinkResponse: TeamLinkResponse = {} as TeamLinkResponse;
  async getTeamLinks(team_Id: string): Promise<TeamLinkResponse[]> {
    let teamLinksArray = [] as TeamLinkResponse[],
      i;
    // const result = (await this.teamLinkRepository
    //   .createQueryBuilder('team_link')
    //   .where('team_link.team_id=:team_id', { team_id: team_Id })
    //   .getMany()) as TeamLinks[];
    const result = await this.teamLinkRepository.find({ where: { team: team_Id } });
    if (result == null) {
      return teamLinksArray;
    } else {
      for (i = 0; i < result.length; i++) {
        this.teamLinkResponse.teamLinkId = result[i].id;
        this.teamLinkResponse.linkName = result[i].linkName;
        this.teamLinkResponse.linkType = result[i].linkType.title;
        this.teamLinkResponse.links = result[i].link;
        teamLinksArray.push(this.teamLinkResponse);
        this.teamLinkResponse = {} as TeamLinkResponse;
      }
      return teamLinksArray;
    }
  }

  aggregationLinkResponse: AggregationLinkResponse = {} as AggregationLinkResponse;
  async getAggregationLinks(team_Id: string): Promise<AggregationLinkResponse[]> {
    let aggregationLinksArray = [] as AggregationLinkResponse[],
      i;
    const result = await this.schedulerConfigRepository.find({ where: { team: team_Id } });
    if (result == null) {
      return aggregationLinksArray;
    } else {
      for (i = 0; i < result.length; i++) {
        this.aggregationLinkResponse.id = result[i].id;
        this.aggregationLinkResponse.url = result[i].url;
        this.aggregationLinkResponse.name = result[i].name.title;
        this.aggregationLinkResponse.aggregationFrequency = result[i].aggregationFrequency;
        this.aggregationLinkResponse.isActive = result[i].isActive;
        this.aggregationLinkResponse.teamId = result[i].team.id;
        this.aggregationLinkResponse.startDate = result[i].startDate;
        aggregationLinksArray.push(this.aggregationLinkResponse);
        this.aggregationLinkResponse = {} as AggregationLinkResponse;
      }
      return aggregationLinksArray;
    }
  }

  /**
   * deleteteamLinkById method will delete the link from team
   */
  async deleteTeamLinkById(teamLinkId: string): Promise<any> {
    return this.teamLinkRepository.delete(teamLinkId);
  }

  /**
   * It will add the link to team
   */
  async createTeamLinks(teamLinkDTO: TeamLinkDTO): Promise<TeamLinks> {
    const link = (await this.linkCategoryRepository.findOne({ where: { id: teamLinkDTO.linkType } })) as LinksCategory;
    let links = new TeamLinks();
    links.linkName = teamLinkDTO.linkName;
    links.linkType = link;
    links.link = teamLinkDTO.links;
    links.team = teamLinkDTO.teamId;
    const teamLinkOutput = await this.teamLinkRepository.save(links);
    console.log(teamLinkOutput);
    return teamLinkOutput;
  }

  /**
   * It will fetch all available categories of links.
   * if no link category available then will throw an error.
   */
  async getLinksCategory(): Promise<LinksCategoryResponse[]> {
    const output = await this.linkCategoryRepository.find();
    if (!output) {
      throw new NotFoundException('No links Found');
    }
    console.log('output');
    console.log(output);
    let linksList = [],
      i;
    for (i = 0; i < output.length; i++) {
      let linkCategory: LinksCategoryResponse = {} as LinksCategoryResponse;
      linkCategory.linkId = output[i].id;
      linkCategory.linkTitle = output[i].title;
      linksList.push(linkCategory);
    }
    return linksList;
  }

  /**
   * It will fetch all available categories of aggregation links.
   * if no link category available then will throw an error.
   */
  async getAggregationLinksCategory(): Promise<AggregationLinksCategoryResponse[]> {
    const output = await this.aggregationLinksCategoryRepository.find();
    if (!output) {
      throw new NotFoundException('No Agggregation links Found');
    }
    console.log('output');
    console.log(output);
    let aggregationLinksList: AggregationLinksCategoryResponse[] = [],
      i;
    for (i = 0; i < output.length; i++) {
      let aggregationLinkCategory: AggregationLinksCategoryResponse = {} as AggregationLinksCategoryResponse;
      aggregationLinkCategory.linkId = output[i].id;
      aggregationLinkCategory.linkTitle = output[i].title;
      aggregationLinksList.push(aggregationLinkCategory);
    }
    return aggregationLinksList;
  }

  /**
   * deleteAggregationLinkById method will delete the aggregation link from team
   */
  async deleteAggregationLinkById(aggregationlinkId: string): Promise<any> {
    return this.schedulerConfigRepository.delete(aggregationlinkId);
  }

  /**
   * It will add the link to team
   */
  async createAggregationLink(aggregationLinkDTO: AggregationLinkDTO): Promise<SchedulerConfig> {
    const aggregationLinkCategory = (await this.aggregationLinksCategoryRepository.findOne({
      where: { id: aggregationLinkDTO.name },
    })) as AggregationLinksCategory;
    if (!aggregationLinkCategory) {
      throw new NotFoundException('Link Category Not Found');
    }

    const team = (await this.teamRespository.findOne({ where: { id: aggregationLinkDTO.teamId } })) as Team;
    if (!team) {
      throw new NotFoundException('Team Not Found');
    }
    const schedularConfigDetails = (await this.schedulerConfigRepository
      .createQueryBuilder('schedular_config')
      .where('schedular_config.team_id =:team_Id', { team_Id: aggregationLinkDTO.teamId })
      .andWhere('schedular_config.name =:name', { name: aggregationLinkDTO.name })
      .take(1)
      .getOne()) as SchedulerConfig;
    if (schedularConfigDetails) {
      let linkName = aggregationLinkCategory.title;
      throw new ConflictException(linkName + ' link already exists');
    }

    let aggregationLink = new SchedulerConfig();
    aggregationLink.name = aggregationLinkCategory;
    aggregationLink.isActive = aggregationLinkDTO.isActive;
    aggregationLink.startDate = aggregationLinkDTO.startDate;
    aggregationLink.url = aggregationLinkDTO.url;
    aggregationLink.aggregationFrequency = aggregationLinkDTO.aggregationFrequency;
    aggregationLink.team = team;
    console.log(aggregationLink);
    const aggregationLinkOutput = await this.schedulerConfigRepository.save(aggregationLink);
    console.log(aggregationLinkOutput);
    return aggregationLinkOutput;
  }
}
