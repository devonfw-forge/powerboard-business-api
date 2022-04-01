import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/model/entities/base-entity.entity';
import { Team } from './team.entity';

@Entity()
export class SchedulerConfig extends BaseEntity {
  @Column('varchar', { name: 'name', length: 255, nullable: true, unique: true })
  name!: string;

  @Column('varchar', { name: 'url', length: 255, nullable: true, unique: true })
  url!: string;

  @Column('timestamp', { name: 'start_date', nullable: true })
  startDate!: string;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @Column('int', { name: 'aggregation_frequency', nullable: true })
  aggregationFrquency!: number;

  @ManyToOne(() => Team, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id', referencedColumnName: 'id' })
  team!: Team;
}
