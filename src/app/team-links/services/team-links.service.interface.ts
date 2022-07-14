import { AggregationLinkDTO } from '../model/dto/aggregationLinkDTO';
import { AggregationLinkResponse } from '../model/dto/AggregationLinkResponse';
import { AggregationLinksCategoryResponse } from '../model/dto/AggregationLinksCategoryResponse';
import { LinksCategoryResponse } from '../model/dto/LinksCategoryResponse';
import { TeamLinkDTO } from '../model/dto/TeamLinkDTO';
import { TeamLinkResponse } from '../model/dto/TeamLinkResponse';
import { TeamLinks } from '../model/entities/team-links.entity';
import { SchedulerConfig } from '../model/entities/third_party_median.entity';

export interface ITeamLinksservice {
  getTeamLinks(team_Id: string): Promise<TeamLinkResponse[]>;
  createTeamLinks(teamLinkDTO: TeamLinkDTO): Promise<TeamLinks>;
  deleteTeamLinkById(teamLinkId: string): Promise<any>;
  getLinksCategory(): Promise<LinksCategoryResponse[]>;

  getAggregationLinksCategory(): Promise<AggregationLinksCategoryResponse[]>;
  getAggregationLinks(team_Id: string): Promise<AggregationLinkResponse[]>;
  deleteAggregationLinkById(aggregationLinkId: string): Promise<any>;
  createAggregationLink(aggregationLinkDTO: AggregationLinkDTO): Promise<SchedulerConfig>;
}
