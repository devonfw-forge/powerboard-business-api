import { Inject, Injectable } from '@nestjs/common';

import { Team } from '../../teams/model/entities/team.entity';

import { ClientStatusResponse } from '../client-status/model/dto/ClientStatusResponse';
import { IClientStatusService } from '../client-status/services/client-status.service.interface';
import { CodeQualityResponse } from '../code-quality-snapshot/model/dto/CodeQualityResponse';
import { ICodeQualityService } from '../code-quality-snapshot/services/code-quality-snapshot.service.interface';
import { DashBoardResponse } from '../model/DashBoardResponse';
import { BurndownResponse } from '../sprint/model/dto/BurndownResponse';
import { SprintDetailResponse } from '../sprint/model/dto/SprintDetailResponse';

import { VelocityComparisonResponse } from '../sprint/model/dto/VelocityComparisonResponse';

import { ISprintCrudService } from '../sprint/services/sprint.crud.service.interface';
import { TeamSpiritResponse } from '../team-spirit/model/dto/TeamSpiritResponse.dto';
import { ITeamSpiritService } from '../team-spirit/services/team-spirit.interface';
import { IDashboardService } from './dashboard.service.interface';

@Injectable()
export class DashboardService implements IDashboardService {
  constructor(
    @Inject('ICodeQualityService') private readonly codequalityService: ICodeQualityService,
    @Inject('ISprintCrudService') private readonly sprintService: ISprintCrudService,
    @Inject('ITeamSpiritService') private readonly teamSpiritServiceInterface: ITeamSpiritService,
    @Inject('IClientStatusService') private readonly clientStatusService: IClientStatusService,
  ) {}

  dash: DashBoardResponse = {} as DashBoardResponse;

  /**
   * it retrieves all the KPIs of powerboard dashboard for a particular team
   */
  async getDashboardByTeamId(team: Team): Promise<DashBoardResponse> {
    this.dash.teamId = team.id;

    const codeQuality: CodeQualityResponse | null = await this.codequalityService.getCodeQualitySnapshot(team.id);

    this.dash.codeQuality = codeQuality;

    const clientStatus: ClientStatusResponse | null = await this.clientStatusService.getClientFeedback(team.id);

    this.dash.clientStatus = clientStatus;

    const teamSpirit: TeamSpiritResponse | null = await this.teamSpiritServiceInterface.getTeamSpiritFromSurvey(
      team.name,
    );

    this.dash.teamSpirit = teamSpirit;

    const sprintDetail: SprintDetailResponse | null = await this.sprintService.getSprintDetailResponse(team.id);

    this.dash.sprintDetail = sprintDetail;
    var sprintUpdatedDate: string = '';
    if (sprintDetail) {
      sprintUpdatedDate = await this.sprintService.getLastUpdatedSprintDate(team.id);
    }

    const burndown: BurndownResponse | null = await this.sprintService.getBurndown(team.id);

    this.dash.burndown = burndown;
    this.dash.sprintWorkUnit = burndown?.workUnit;
    if (this.dash.burndown) {
      this.dash.burndown.updatedAt = sprintUpdatedDate;
    }

    const velocityComparisonDTO: VelocityComparisonResponse | null = await this.sprintService.getVelocityComparison(
      team.id,
    );

    this.dash.velocity = velocityComparisonDTO;
    if (this.dash.velocity) {
      this.dash.velocity.updatedAt = sprintUpdatedDate;
    }
    this.dash.teamStatus = this.fetchStatus(this.dash);
    return this.dash;
  }

  /**
   * It calculates the consolidated status of all respective KPIs of dashboard
   */
  fetchStatus(dashboard: DashBoardResponse): number | null {
    let statusResult;
    if (dashboard?.clientStatus == null || dashboard.codeQuality == null) {
      statusResult = 2;
      return statusResult;
    } else {
      const codeQualityStatus = dashboard.codeQuality!.status;
      //const teamSpiritStatus = dashboard!.teamSpirit!.teamSpiritRating;
      const clientStatus = dashboard.clientStatus.clientSatisfactionRating;
      const burndownStatus = dashboard.burndown!.burndownStatus;
      if (
        clientStatus >= 6 &&
        //teamSpiritStatus >= 6 &&
        codeQualityStatus == 'PASSED' &&
        burndownStatus == 'Ahead Time'
      ) {
        statusResult = 1;
      } else if (
        clientStatus < 6 &&
        //teamSpiritStatus < 6 &&
        codeQualityStatus == 'FAILED' &&
        burndownStatus == 'Behind Time'
      ) {
        statusResult = 2;
      } else {
        statusResult = 3;
      }
      console.log('status');
      console.log(statusResult);
      return statusResult;
    }
  }
}
