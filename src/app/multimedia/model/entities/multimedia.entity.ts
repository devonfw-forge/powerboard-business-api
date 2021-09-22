import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../shared/model/entities/base-entity.entity';
import { Team } from '../../../teams/model/entities/team.entity';

@Entity()
export class Multimedia extends BaseEntity {
  @Column('varchar', { name: 'file_name', length: 3000, nullable: false })
  fileName!: string;

  @ManyToOne(() => Team, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'multimedia_team_id', referencedColumnName: 'id' })
  team!: string;
}
