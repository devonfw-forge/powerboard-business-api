export class TeamLinksMockService {
  constructor() {}
  public getTeamLinks = jest.fn();
  public createTeamLinks = jest.fn();
  public deleteTeamLinkById = jest.fn();
  public getLinksCategory = jest.fn();
  public getAggregationLinksCategory = jest.fn();
  public deleteAggregationLinkById = jest.fn();
  public createAggregationLink = jest.fn();
}
