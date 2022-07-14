import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  AggregationLinksCategoryMock,
  LinksCategoryMock,
  SchedulerConfigRepositoryMock,
  TeamLinksMockRepo,
  TeamRepositoryMock,
} from '../../../../test/mockCrudRepository/crudRepository.mock';
import { Team } from '../../teams/model/entities/team.entity';
import { TeamLinkDTO } from '../model/dto/TeamLinkDTO';
import { AggregationLinksCategory } from '../model/entities/aggregation_links_category.entity';

import { LinksCategory } from '../model/entities/link-category.entity';
import { TeamLinks } from '../model/entities/team-links.entity';
import { SchedulerConfig } from '../model/entities/third_party_median.entity';
import { TeamLinksCrudService } from './team-links.crud.service';

describe('TeamLinksCrudService', () => {
  let teamRepo: TeamRepositoryMock;
  let teamLinkService: TeamLinksCrudService;
  let teamLinkRepo: TeamLinksMockRepo;
  let linkCategoryRepo: LinksCategoryMock;
  let aggregationLinkCategoryRepo: AggregationLinksCategoryMock;
  let schedulerConfigRepo: SchedulerConfigRepositoryMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamLinksCrudService,
        {
          provide: getRepositoryToken(TeamLinks),
          useClass: TeamLinksMockRepo,
        },
        {
          provide: getRepositoryToken(LinksCategory),
          useClass: LinksCategoryMock,
        },
        {
          provide: getRepositoryToken(AggregationLinksCategory),
          useClass: AggregationLinksCategoryMock,
        },
        {
          provide: getRepositoryToken(SchedulerConfig),
          useClass: SchedulerConfigRepositoryMock,
        },
        {
          provide: getRepositoryToken(Team),
          useClass: TeamRepositoryMock,
        },
      ],
    }).compile();
    teamRepo = module.get<TeamRepositoryMock>(getRepositoryToken(Team));
    teamLinkService = module.get<TeamLinksCrudService>(TeamLinksCrudService);
    teamLinkRepo = module.get<TeamLinksMockRepo>(getRepositoryToken(TeamLinks));
    linkCategoryRepo = module.get<LinksCategoryMock>(getRepositoryToken(LinksCategory));
    aggregationLinkCategoryRepo = module.get<AggregationLinksCategoryMock>(
      getRepositoryToken(AggregationLinksCategory),
    );
    schedulerConfigRepo = module.get<SchedulerConfigRepositoryMock>(getRepositoryToken(SchedulerConfig));
  });

  it('should be defined after module initialization', () => {
    expect(teamRepo).toBeDefined();
    expect(teamLinkService).toBeDefined();
    expect(teamLinkRepo).toBeDefined();
    expect(linkCategoryRepo).toBeDefined();
    expect(aggregationLinkCategoryRepo).toBeDefined();
    expect(schedulerConfigRepo).toBeDefined();
  });

  const teamId: string = '46455bf7-ada7-495c-8019-8d7ab76d488e';

  describe('getTeamLinks', () => {
    it('getTeamLinks() method should return TeamLinkResponse', async () => {
      const teamLinks: TeamLinks[] = [
        {
          id: '51055bf7-ada6-495c-8019-8d7ab76d488e',
          version: 1,
          createdAt: '2021-04-28T05:57:33.080Z',
          updatedAt: '2021-04-28T05:57:33.080Z',
          linkType: {
            id: '10005bf7-ada7-495c-8019-8d7ab62d488e',
            version: 1,
            createdAt: '2021-07-21T06:39:42.843Z',
            updatedAt: '2021-07-21T06:39:42.843Z',
            title: 'web_link',
          },
          linkName: 'Jira',
          link: 'https://powerboard-capgemini.atlassian.net/jira/software/projects/DUM/boards/3',
          team: teamId,
        },
      ];

      const expectedTeamLinksResponse = [
        {
          teamLinkId: '51055bf7-ada6-495c-8019-8d7ab76d488e',
          linkName: 'Jira',
          linkType: 'web_link',
          links: 'https://powerboard-capgemini.atlassian.net/jira/software/projects/DUM/boards/3',
        },
      ];

      jest.spyOn(teamLinkRepo, 'find').mockImplementation(() => teamLinks);
      const actualTeamLinksResponse = await teamLinkService.getTeamLinks(teamId);
      // expect(teamLinkRepo.createQueryBuilder).toBeCalledTimes(1);
      expect(actualTeamLinksResponse).toEqual(expectedTeamLinksResponse);
    });
  });

  describe('getAggregationLinks', () => {
    it('getAggregationLinks() method should return AggregationLinkResponse', async () => {
      const aggregationLinks: SchedulerConfig[] = [
        {
          id: '51055bf7-ada6-495c-8019-8d7ab76d488e',
          version: 1,
          createdAt: '2021-04-28T05:57:33.080Z',
          updatedAt: '2021-04-28T05:57:33.080Z',

          name: {
            id: '10005bf7-ada7-495c-8019-8d7ab62d488e',
            version: 1,
            createdAt: '2021-07-21T06:39:42.843Z',
            updatedAt: '2021-07-21T06:39:42.843Z',
            title: 'jira',
          },
          isActive: true,
          url: 'https://powerboard-capgemini.atlassian.net/jira/software/projects/DUM/boards/3',
          team: {
            id: '46455bf7-ada7-495c-8019-8d7ab76d488e',
            version: 1,
            createdAt: '',
            updatedAt: '',
            ad_center: {
              id: '',
              createdAt: '',
              updatedAt: '',
              version: 1,
              name: '',
            },
            isStatusChanged: true,
            isTeamConfigured: true,
            logo: '',
            name: '',
            projectKey: '',
            teamCode: '',
            team_status: {
              id: 1,
              description: '',
              status: '',
            },
            userTeam: [],
          },
          aggregationFrequency: 12,
          startDate: '2021-07-21T06:39:42.843Z',
        },
      ];

      const expectedAggregationLinksResponse = [
        {
          id: '51055bf7-ada6-495c-8019-8d7ab76d488e',
          url: 'https://powerboard-capgemini.atlassian.net/jira/software/projects/DUM/boards/3',
          name: 'jira',
          aggregationFrequency: 12,
          isActive: true,
          teamId: '46455bf7-ada7-495c-8019-8d7ab76d488e',
          startDate: '2021-07-21T06:39:42.843Z',
        },
      ];

      jest.spyOn(schedulerConfigRepo, 'find').mockImplementation(() => aggregationLinks);
      const actualTeamLinksResponse = await teamLinkService.getAggregationLinks(teamId);
      // expect(teamLinkRepo.createQueryBuilder).toBeCalledTimes(1);
      expect(actualTeamLinksResponse).toEqual(expectedAggregationLinksResponse);
    });
  });

  describe('createTeamLinks', () => {
    it('createTeamLinks() method should return saved TeamLinks', async () => {
      const teamLinkDTO: TeamLinkDTO = {
        linkName: 'Google Docs1',
        linkType: '10005bf7-ada7-495c-8019-8d7ab62d488e',
        links: 'http://google/docs.com',
        teamId: teamId,
      };

      const expectedTeamLinkSaved = {
        linkName: 'Google Docs1',
        linkType: {
          id: '2239aacf-ba66-4815-b082-f02a68d96008',
          title: 'web_link',
        },
        link: 'http://google/docs.com',
        team: '46455bf7-ada7-495c-8019-8d7ab76d488e',
        id: '2299aacf-ba66-4815-b082-f02a68d96008',
      };

      jest.spyOn(teamLinkRepo, 'save').mockImplementation(() => expectedTeamLinkSaved);
      const actualSavedTeamLink = await teamLinkService.createTeamLinks(teamLinkDTO);
      expect(teamLinkRepo.save).toBeCalledTimes(1);
      expect(actualSavedTeamLink).toEqual(expectedTeamLinkSaved);
    });
  });

  describe('deleteTeamLinkById', () => {
    it('deleteTeamLinkById() should delete the given team links ', async () => {
      const teamLinkId: string = '2299aacf-ba66-4815-b082-f02a68d96008';

      jest.spyOn(teamLinkRepo, 'delete').mockImplementation(() => undefined);

      await teamLinkService.deleteTeamLinkById(teamLinkId);
      expect(teamLinkRepo.delete).toBeCalledTimes(1);
      expect(teamLinkRepo.delete).toBeCalledWith(teamLinkId);
    });
  });
  describe('getLinksCategory', () => {
    it(' should throw error message if the links are not present', async () => {
      jest.spyOn(teamLinkRepo, 'find').mockImplementation(() => undefined);
      try {
        await teamLinkService.getLinksCategory();
      } catch (e) {
        expect(e.message).toMatch('No links Found');
      }
    });
    it(' should fetch all the links category present', async () => {
      const teamLinks = [
        {
          id: '10005bf7-ada7-495c-8019-8d7ab62d488e',
          version: 1,
          createdAt: '2021-09-08T11:39:39.145Z',
          updatedAt: '2021-09-08T11:39:39.145Z',
          title: 'web_link',
        },
        {
          id: '10006bf7-ada7-495c-8019-8d7ab62d488e',
          version: 1,
          createdAt: '2021-09-08T11:39:39.145Z',
          updatedAt: '2021-09-08T11:39:39.145Z',
          title: 'meeting_link',
        },
      ];
      const linksCategories = [
        {
          linkId: '10005bf7-ada7-495c-8019-8d7ab62d488e',
          linkTitle: 'web_link',
        },
        {
          linkId: '10006bf7-ada7-495c-8019-8d7ab62d488e',
          linkTitle: 'meeting_link',
        },
      ];
      jest.spyOn(linkCategoryRepo, 'find').mockImplementation(() => teamLinks);

      const result = await teamLinkService.getLinksCategory();
      expect(result).toEqual(linksCategories);
    });
  });

  describe('getAggregationLinksCategory', () => {
    it(' should throw error message if the aggregation links are not present', async () => {
      jest.spyOn(aggregationLinkCategoryRepo, 'find').mockImplementation(() => undefined);
      try {
        await teamLinkService.getAggregationLinksCategory();
      } catch (e) {
        expect(e.message).toMatch('No Agggregation links Found');
      }
    });
    it(' should fetch all the aggregation links category present', async () => {
      const aggregationLinks = [
        {
          id: '10005bf7-ada7-495c-8019-8d7ab62d488e',
          version: 1,
          createdAt: '2021-09-08T11:39:39.145Z',
          updatedAt: '2021-09-08T11:39:39.145Z',
          title: 'jira',
        },
      ];
      const aggregationLinksCategories = [
        {
          linkId: '10005bf7-ada7-495c-8019-8d7ab62d488e',
          linkTitle: 'jira',
        },
      ];
      jest.spyOn(aggregationLinkCategoryRepo, 'find').mockImplementation(() => aggregationLinks);

      const result = await teamLinkService.getAggregationLinksCategory();
      expect(result).toEqual(aggregationLinksCategories);
    });
  });

  describe('deleteAggregationLinkById', () => {
    it('deleteAggregationLinkById() should delete the given aggregation links ', async () => {
      const aggregationLinkId: string = '2299aacf-ba66-4815-b082-f02a68d96008';

      jest.spyOn(schedulerConfigRepo, 'delete').mockImplementation(() => undefined);

      await teamLinkService.deleteAggregationLinkById(aggregationLinkId);
      expect(schedulerConfigRepo.delete).toBeCalledTimes(1);
      expect(schedulerConfigRepo.delete).toBeCalledWith(aggregationLinkId);
    });
  });
});
