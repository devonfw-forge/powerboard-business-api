import { Module, HttpModule } from '@nestjs/common';
import { Team } from './model/entities/team.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamCrudService } from './services/team.crud.service';
import { TeamCrudController } from './controllers/team.crud.controller';
import { VisibilityModule } from '../visibility/visibility.module';
import { TeamLinksModule } from '../team-links/team-links.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { ADCenter } from '../ad-center/model/entities/ad-center.entity';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { GlobalTeamsService } from './services/global.team.service';
import { TeamStatus } from './model/entities/team_status.entity';
import { TeamSpiritCrudService } from '../dashboard/team-spirit/services/team-spirit.crud.service';
import { TeamSpiritModule } from '../dashboard/team-spirit/team-spirit.module';
import { TeamSpirit } from '../dashboard/team-spirit/model/entities/team-spirit.entity';
import { TeamSpiritMedian } from '../dashboard/team-spirit/model/entities/team-spirit-median.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, ADCenter, TeamStatus, TeamSpirit, TeamSpiritMedian]),
    DashboardModule,
    MultimediaModule,
    VisibilityModule,
    TeamLinksModule,
    TeamSpiritModule,
    FileStorageModule,
    HttpModule,
  ],
  providers: [
    {
      provide: 'ITeamService',
      useClass: TeamCrudService,
    },
    {
      provide: 'IGlobalTeamService',
      useClass: GlobalTeamsService,
    },
    {
      provide: 'ITeamSpiritService',
      useClass: TeamSpiritCrudService
    }
  ],
  controllers: [TeamCrudController],
  exports: ['ITeamService', 'IGlobalTeamService'],
})
export class TeamsModule {}
