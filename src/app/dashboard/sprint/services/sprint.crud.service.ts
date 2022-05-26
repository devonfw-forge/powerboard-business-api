import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { BurndownResponse } from '../model/dto/BurndownResponse';
import { SprintDetailResponse } from '../model/dto/SprintDetailResponse';
import { VelocityComparisonResponse } from '../model/dto/VelocityComparisonResponse';
import { Sprint } from '../model/entities/sprint.entity';
import { SprintSnapshot } from '../model/entities/sprintSnapshot.entity';
import { SprintSnapshotMetric } from '../model/entities/sprintSnapshotMetric.entity';
import { SprintMetric } from '../model/entities/sprint_metric.entity';
import { SprintStatus } from '../model/entities/sprint_status.entity';
import { SprintWorkUnit } from '../model/entities/sprint_work_unit.entity';
import { ISprintCrudService } from './sprint.crud.service.interface';

@Injectable()
export class SprintCrudService extends TypeOrmCrudService<Sprint> implements ISprintCrudService {
  constructor(@InjectRepository(Sprint) private readonly sprintRepository: Repository<Sprint>) {
    super(sprintRepository);
  }

  /**
   * it will fetch the current sprint details from db and create a sprint detail response
   */
  async getSprintDetailResponse(teamId: string): Promise<SprintDetailResponse | undefined> {
    let sprintDetailResponse: SprintDetailResponse = {} as SprintDetailResponse;

    const sprintDetail = await this.sprintRepository
      .createQueryBuilder('sprint')
      .addSelect('sprint.id', 'sprint_id')
      .addSelect('st.status', 'st_status')
      .addSelect('ss.id', 'ss_id')
      .addSelect('smt.name', 'smt_name')
      .addSelect('ssm.value', 'ssm_value')
      .addSelect('ss.date_time', 'ss_date_time')
      .innerJoin(SprintStatus, 'st', 'st.id=sprint.status')
      .innerJoin(SprintSnapshot, 'ss', 'ss.sprint_id=sprint.id')
      .innerJoin(SprintSnapshotMetric, 'ssm', 'ssm.snapshot_id=ss.id')
      .leftJoin(SprintMetric, 'smt', 'smt.id=ssm.metric_id')
      .where('sprint.team_id =:team_Id', { team_Id: teamId })
      .andWhere('sprint.status=:status', { status: '11155bf2-ada5-495c-8019-8d7ab76d488e' })
      .orderBy('ss.date_time', 'DESC')
      .limit(2)
      .getRawMany();
    console.log('sprint detail response ***************************************');
    console.log(sprintDetail);
    if (sprintDetail[0] == null) {
      return undefined;
    } else {
      var end_date = new Date(sprintDetail[0].sprint_end_date);
      var start_date = new Date(sprintDetail[0].sprint_start_date);
      var currentDate = new Date();
      const diff1 = Math.abs(currentDate.getTime() - start_date.getTime());
      const diff2 = Math.abs(end_date.getTime() - start_date.getTime());
      const Sprint_current_day = Math.ceil(diff1 / (1000 * 60 * 60 * 24));
      const Sprint_days = Math.ceil(diff2 / (1000 * 60 * 60 * 24));
      sprintDetailResponse.Sprint_current_day = Sprint_current_day;
      sprintDetailResponse.sprint_number = sprintDetail[0].sprint_sprint_number;
      sprintDetailResponse.Sprint_days = Sprint_days;
      return sprintDetailResponse;
    }
  }
  burndownResponse: BurndownResponse = {} as BurndownResponse;

  /**
   * it will retrieve the burndown report of current sprint and create a burndown response for the team
   */
  async getBurndown(teamId: string): Promise<BurndownResponse | undefined> {
    let output: BurndownResponse = {} as BurndownResponse;

    const sprintForBurndown = await this.sprintRepository
      .createQueryBuilder('sprint')
      .addSelect('sprint.id', 'sprint_id')
      .addSelect('st.status', 'st_status')
      .addSelect('ss.id', 'ss_id')
      .addSelect('smt.name', 'smt_name')
      .addSelect('ssm.value', 'ssm_value')
      .addSelect('ss.date_time', 'ss_date_time')
      .addSelect('sw.work_unit', 'sw_work_unit')
      .innerJoin(SprintStatus, 'st', 'st.id=sprint.status')
      .innerJoin(SprintSnapshot, 'ss', 'ss.sprint_id=sprint.id')
      .innerJoin(SprintSnapshotMetric, 'ssm', 'ssm.snapshot_id=ss.id')
      .innerJoin(SprintWorkUnit, 'sw', 'sw.id=sprint.work_unit')
      .leftJoin(SprintMetric, 'smt', 'smt.id=ssm.metric_id')
      .where('sprint.team_id =:team_Id', { team_Id: teamId })
      .andWhere('sprint.status=:status', { status: '11155bf2-ada5-495c-8019-8d7ab76d488e' })
      .orderBy('ss.date_time', 'DESC')
      .limit(2)
      .getRawMany();

    console.log('Get Burndown ***************************');
    console.log(sprintForBurndown);
    if (sprintForBurndown[0] == null) {
      return undefined;
    } else {
      const start_date = new Date(sprintForBurndown[0].sprint_start_date);
      const end_date = new Date(sprintForBurndown[0].sprint_end_date);
      const diff = Math.abs(new Date().getTime() - start_date.getTime());
      const diff1 = Math.abs(end_date.getTime() - start_date.getTime());
      const currentDay = Math.ceil(diff / (1000 * 60 * 60 * 24));
      const totalDays = Math.ceil(diff1 / (1000 * 60 * 60 * 24));
      console.log(start_date + '  ' + end_date);
      console.log(currentDay + '  ' + totalDays);
      const excludeDays = (totalDays / 7) * 2;
      const businessDays = totalDays - excludeDays;

      if (sprintForBurndown[0].smt_name == 'Work Committed') {
        return this.calculateBurnDownFirstCase(sprintForBurndown, businessDays, currentDay);
      } else if (sprintForBurndown[0].smt_name == 'Work Completed') {
        return this.calculateBurnDownSecondCase(sprintForBurndown, businessDays, currentDay);
      } else {
        console.log('work spillover');
      }
      return output;
    }
  }

  async getLastUpdatedSprintDate(teamId: string): Promise<string> {
    const sprintUpdatedDetails = (await this.sprintRepository
      .createQueryBuilder('sprint')
      .where('sprint.team_id =:team_Id', { team_Id: teamId })
      .orderBy('sprint.updatedAt', 'DESC')
      .take(1)
      .getOne()) as Sprint;
    console.log(sprintUpdatedDetails);
    return sprintUpdatedDetails.updatedAt;
  }

  /**
   * it will calculate the burndown and the burndown status of current sprint if 'Work Committed' is
   * there at index 0 of sprintForBurndown array
   */
  calculateBurnDownFirstCase(sprintForBurndown: any, totalDays: number, currentDay: number): BurndownResponse {
    if (Number(sprintForBurndown[0].ssm_value) > Number(sprintForBurndown[1].ssm_value)) {
      this.burndownResponse.workUnit = sprintForBurndown[0].sw_work_unit;
      this.burndownResponse.remainingDays = totalDays - currentDay;
      console.log(this.burndownResponse.remainingDays);
      this.burndownResponse.remainingWork = sprintForBurndown[0].ssm_value - sprintForBurndown[1].ssm_value;
      const ideal = Math.round((sprintForBurndown[0].ssm_value / totalDays) * currentDay);
      const actual = sprintForBurndown[1].ssm_value;
      this.burndownResponse.updatedAt = sprintForBurndown[0].ss_date_time;
      this.burndownResponse = this.getBurndownStatus(ideal, actual);
    }
    console.log('Burrrrrrrrrrrnnnnnnnnnnnn');
    console.log(this.burndownResponse);
    return this.burndownResponse;
  }

  /**
   * it will calculate the burndown and the burndown status of current sprint if 'Work Completed' is
   * there at index 0 of sprintForBurndown array
   */
  calculateBurnDownSecondCase(sprintForBurndown: any, totalDays: number, currentDay: number): BurndownResponse {
    if (Number(sprintForBurndown[0].ssm_value) < Number(sprintForBurndown[1].ssm_value)) {
      this.burndownResponse.workUnit = sprintForBurndown[0].sw_work_unit;
      this.burndownResponse.remainingDays = totalDays - currentDay;
      console.log(this.burndownResponse.remainingDays);
      this.burndownResponse.remainingWork = sprintForBurndown[1].ssm_value - sprintForBurndown[0].ssm_value;
      const ideal = Math.round((sprintForBurndown[1].ssm_value / totalDays) * currentDay);
      const actual = sprintForBurndown[0].ssm_value;
      this.burndownResponse.updatedAt = sprintForBurndown[1].ss_date_time;
      this.burndownResponse = this.getBurndownStatus(ideal, actual);
    }

    return this.burndownResponse;
  }

  /**
   * it returns the current status of the burndown of sprint for a team
   */
  getBurndownStatus(ideal: number, actual: number): BurndownResponse {
    if (ideal > actual) {
      this.burndownResponse.count = ideal - actual;
      this.burndownResponse.burndownStatus = 'Behind Time';
    } else if (ideal == actual) {
      this.burndownResponse.burndownStatus = 'On Time';
    } else {
      this.burndownResponse.count = actual - ideal;
      this.burndownResponse.burndownStatus = 'Ahead Time';
    }
    return this.burndownResponse;
  }

  velocityComparisonResponse = {} as VelocityComparisonResponse;
  /**
   * it retrieves the velocity report of current sprint and also the same for previous sprints
   * and then creates the response for the velocity comparison
   */
  async getVelocityComparison(teamId: string): Promise<VelocityComparisonResponse | undefined> {
    const sprintMetricsResponse = await this.sprintRepository
      .createQueryBuilder('sprint')
      .addSelect('sprint.id', 'sprint_id')
      .addSelect('st.status', 'st_status')
      .addSelect('ss.id', 'ss_id')
      .addSelect('ss.date_time', 'ss_date_time')
      .addSelect('smt.name', 'smt_name')
      .addSelect('ssm.value', 'ssm_value')
      .innerJoin(SprintStatus, 'st', 'st.id=sprint.status')
      .innerJoin(SprintSnapshot, 'ss', 'ss.sprint_id=sprint.id')
      .innerJoin(SprintSnapshotMetric, 'ssm', 'ssm.snapshot_id=ss.id')
      .leftJoin(SprintMetric, 'smt', 'smt.id=ssm.metric_id')
      .where('sprint.team_id =:team_Id', { team_Id: teamId })
      .andWhere('sprint.status=:status', { status: '11155bf2-ada5-495c-8019-8d7ab76d488e' })
      .orderBy('ss.date_time', 'DESC')
      .limit(2)
      .getRawMany();

    console.log('Get Velocity Comparison ****************************************');
    console.log(sprintMetricsResponse);
    if (sprintMetricsResponse == null) {
      return undefined;
    } else {
      const previousSprintCompleted = await this.sprintRepository
        .createQueryBuilder('sprint')
        .addSelect('sprint.id', 'sprint_id')
        .addSelect('st.status', 'st_status')
        .addSelect('ss.id', 'ss_id')
        .addSelect('smt.name', 'smt_name')
        .addSelect('ssm.value', 'ssm_value')
        .innerJoin(SprintStatus, 'st', 'st.id=sprint.status')
        .innerJoin(SprintSnapshot, 'ss', 'ss.sprint_id=sprint.id')
        .innerJoin(SprintSnapshotMetric, 'ssm', 'ssm.snapshot_id=ss.id')
        .leftJoin(SprintMetric, 'smt', 'smt.id=ssm.metric_id')
        .where('sprint.team_id =:team_Id', { team_Id: teamId })
        .andWhere('sprint.status=:status', { status: '11155bf3-ada5-495c-8019-8d7ab76d488e' })
        .andWhere('ssm.metric_id=:metric_id', { metric_id: '11155bf2-ada5-495c-8019-8d7ab76d488e' })
        .orderBy('sprint.id')
        .getRawMany();
      console.log('Previous sprint completed ***********************');
      console.log(previousSprintCompleted);
      if (previousSprintCompleted.length == 0 || previousSprintCompleted == null) {
        console.log('ho gya');
        return undefined;
      } else {
        this.velocityComparisonResponse.Avg = this.getAverageVelocity(previousSprintCompleted);
        this.velocityComparisonResponse.updatedAt = sprintMetricsResponse[0].ss_date_time;
        this.velocityComparisonResponse = this.getVelocityData(sprintMetricsResponse);
        console.log('velocccittttttttttyyyyy');
        console.log(this.velocityComparisonResponse);
        return this.velocityComparisonResponse;
      }
    }
  }

  /**
   * it calculates the average velocity of all the previously completed sprints
   */
  getAverageVelocity(previousSprintCompleted: any): number {
    let sum = 0;
    for (let value of previousSprintCompleted) {
      sum = sum + Number(value.ssm_value);
    }
    return sum / previousSprintCompleted.length;
  }

  /**
   * it assigns the current sprint's metrics(work committed or work completed) data in the velocity
   * comparison response
   */
  getVelocityData(sprintMetricsResponse: any): VelocityComparisonResponse {
    for (let sprintMetric of sprintMetricsResponse) {
      if (sprintMetric.smt_name == 'Work Completed') {
        this.velocityComparisonResponse.Completed = Number(sprintMetric.ssm_value);
      }
      if (sprintMetric.smt_name == 'Work Committed') {
        this.velocityComparisonResponse.Committed = Number(sprintMetric.ssm_value);
      }
    }
    /* if (sprintMetricsResponse[0].smt_name == 'Work Committed') {
      this.velocityComparisonResponse.Committed = Number(sprintMetricsResponse[0].ssm_value);
      this.velocityComparisonResponse.Completed = Number(sprintMetricsResponse[1].ssm_value);
    } else if (sprintMetricsResponse[1].smt_name == 'Work Committed') {
      this.velocityComparisonResponse.Committed = Number(sprintMetricsResponse[1].ssm_value);
      this.velocityComparisonResponse.Committed = Number(sprintMetricsResponse[0].ssm_value);
    } */
    return this.velocityComparisonResponse;
  }
}
