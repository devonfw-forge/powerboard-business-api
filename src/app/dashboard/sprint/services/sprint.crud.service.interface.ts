import { BurndownResponse } from '../model/dto/BurndownResponse';
import { SprintDetailResponse } from '../model/dto/SprintDetailResponse';
import { VelocityComparisonResponse } from '../model/dto/VelocityComparisonResponse';

export interface ISprintCrudService {
  getSprintDetailResponse(teamId: string): Promise<SprintDetailResponse | undefined>;
  getBurndown(teamId: string): Promise<BurndownResponse | undefined>;
  getVelocityComparison(teamId: string): Promise<VelocityComparisonResponse | undefined>;
  getLastUpdatedSprintDate(teamId: string): Promise<string>;
  // sprintWorkUnit(teamId: string): Promise<SprintWorkUnitResponse | undefined>
}
