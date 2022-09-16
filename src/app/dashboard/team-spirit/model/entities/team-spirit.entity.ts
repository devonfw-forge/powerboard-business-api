import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../shared/model/entities/base-entity.entity';
import { Team } from '../../../../teams/model/entities/team.entity';

@Entity()
export class TeamSpirit extends BaseEntity {
  @Column('varchar', {  name: 'team_name', length: 255, unique: true, nullable: false })
  teamName!: string;

  @ManyToOne(() => Team, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id', referencedColumnName: 'id' })
  team!: Team;
}
