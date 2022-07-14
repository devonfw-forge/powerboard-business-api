import { TeamLinkResponse } from 'src/app/team-links/model/dto/TeamLinkResponse';
import { DashBoardResponse } from '../../../dashboard/model/DashBoardResponse';
import { MultimediaResponse } from '../../../multimedia/model/dto/MultimediaResponse';
import { AggregationLinkResponse } from '../../../team-links/model/dto/AggregationLinkResponse';

export interface PowerboardResponse {
  team_id: string;
  team_name: string;
  project_key: string;
  center: string;
  logo: string | null;
  team_code: string;
  privileges: string[];
  dashboard: DashBoardResponse;
  teamLinks: TeamLinkResponse[] | undefined;
  aggregationLinks: AggregationLinkResponse[] | undefined;
  multimedia: MultimediaResponse;
  isTeamConfigured: boolean;
}
