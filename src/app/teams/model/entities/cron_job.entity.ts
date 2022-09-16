import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../shared/model/entities/base-entity.entity';
import { Team } from './team.entity';

@Entity()
export class CronJob extends BaseEntity {
  @Column('varchar', { length: 255, nullable: false })
  status!: string;

  @Column('varchar', { name: 'application', length: 255, nullable: false })
  application!: string;

  @ManyToOne(() => Team, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id', referencedColumnName: 'id' })
  team!: string;
}
