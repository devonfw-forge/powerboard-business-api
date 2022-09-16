import { TeamSpiritResponse } from '../model/dto/TeamSpiritResponse.dto';

export interface ITeamSpiritService {
  getTeamSpiritFromSurvey(teamId: string): Promise<TeamSpiritResponse | undefined>;
  updateTeamSpiritName(teamId: string, teamSpiritName: string): Promise<any>;
  getTeamSpiritTeamName(teamId: string): Promise<string>;
}
