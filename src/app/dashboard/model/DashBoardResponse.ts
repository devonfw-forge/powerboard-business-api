import { ClientStatusResponse } from '../client-status/model/dto/ClientStatusResponse';
import { CodeQualityResponse } from '../code-quality-snapshot/model/dto/CodeQualityResponse';
import { SprintDetailResponse } from '../sprint/model/dto/SprintDetailResponse';
import { TeamSpiritResponse } from '../team-spirit/model/dto/TeamSpiritResponse.dto';
import { BurndownResponse } from '../sprint/model/dto/BurndownResponse';
import { VelocityComparisonResponse } from '../sprint/model/dto/VelocityComparisonResponse';

export interface DashBoardResponse {
  teamId: string;
  sprintWorkUnit?: string;
  teamStatus: number | null;
  codeQuality: CodeQualityResponse | null;
  clientStatus: ClientStatusResponse | null;
  teamSpirit: TeamSpiritResponse | null;
  burndown: BurndownResponse | null;
  sprintDetail: SprintDetailResponse | null;
  velocity: VelocityComparisonResponse | null;
}
