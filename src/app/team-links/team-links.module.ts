import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../teams/model/entities/team.entity';
import { TeamLinksCrudController } from './controllers/team-links.crud.controller';
import { AggregationLinksCategory } from './model/entities/aggregation_links_category.entity';
import { LinksCategory } from './model/entities/link-category.entity';
import { TeamLinks } from './model/entities/team-links.entity';
import { SchedulerConfig } from './model/entities/third_party_median.entity';
import { TeamLinksCrudService } from './services/team-links.crud.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamLinks, LinksCategory, AggregationLinksCategory, SchedulerConfig, Team])],
  providers: [
    {
      provide: 'ITeamLinksService',
      useClass: TeamLinksCrudService,
    },
  ],
  controllers: [TeamLinksCrudController],
  exports: ['ITeamLinksService'],
})
export class TeamLinksModule {}
