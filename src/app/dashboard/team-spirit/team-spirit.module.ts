import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamSpiritCrudService } from './services/team-spirit.crud.service';
import { TeamSpiritCrudController } from './controllers/team-spirit.crud.controller';
import { Team } from '../../teams/model/entities/team.entity';
import { TeamSpiritMedian } from './model/entities/team-spirit-median.entity';
import { TeamSpirit } from './model/entities/team-spirit.entity';
import { ADCenter } from '../../ad-center/model/entities/ad-center.entity';
import { TeamStatus } from '../../teams/model/entities/team_status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamSpiritMedian, Team, TeamSpirit,  ADCenter, TeamStatus]), HttpModule],
  providers: [
    {
      provide: 'ITeamSpiritService',
      useClass: TeamSpiritCrudService,
    },
  ],
  controllers: [TeamSpiritCrudController],
  exports: ['ITeamSpiritService'],
})
export class TeamSpiritModule {}
