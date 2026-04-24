import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('profiles')
export class ProfileEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  name: string;

  @Index()
  @Column()
  gender: string;

  @Column('real')
  gender_probability: number;

  @Index()
  @Column('int')
  age: number;

  @Index()
  @Column()
  age_group: string;

  @Index()
  @Column({ length: 2 })
  country_id: string;

  @Column()
  country_name: string;

  @Column('real')
  country_probability: number;

  @Index()
  @CreateDateColumn({
    type: 'date',
  })
  created_at: Date;
}