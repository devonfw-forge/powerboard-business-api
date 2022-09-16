import { Body, Controller, Get, Inject, Param, Post, Response } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { CrudType } from '@devon4node/common/serializer';
import { TeamSpirit } from '../model/entities/team-spirit.entity';
import { ITeamSpiritService } from '../services/team-spirit.interface';
import { Response as eResponse } from 'express';

@Crud({
  model: {
    type: TeamSpirit,
  },
})
@CrudType(TeamSpirit)
@Controller('team-spirit')
export class TeamSpiritCrudController {
  constructor(@Inject('ITeamSpiritService') public teamSpiritServiceInterface: ITeamSpiritService) {}

  @Get('/surveyResult/:teamId')
  async getTeamSpiritFromSurvery(@Param('teamId') teamId: string): Promise<any> {
    return this.teamSpiritServiceInterface.getTeamSpiritFromSurvey(teamId);
  }

  @Post('/update/teamName/:teamId')
  async updateTeamSpiritTeamName(
    @Param('teamId') teamId: string,
    @Body() teamSpiritName: any,
    @Response() res: eResponse,
  ): Promise<void> {
    console.log('team configured =====================================================');
    console.log(status);
    const result = await this.teamSpiritServiceInterface.updateTeamSpiritName(teamId, teamSpiritName);
    console.log(result);
    res.status(200).json({ message: 'Team Successfully Configured' });
  }
}
