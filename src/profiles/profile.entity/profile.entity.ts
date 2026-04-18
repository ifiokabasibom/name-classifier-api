import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('profiles')
export class ProfileEntity {
  @PrimaryColumn()
  id: string;

  @Index({ unique: true })
  @Column()
  name: string;

  @Column()
  gender: string;

  @Column('real')
  gender_probability: number;

  @Column()
  sample_size: number;

  @Column()
  age: number;

  @Column()
  age_group: string;

  @Column()
  country_id: string;

  @Column('real')
  country_probability: number;

  @CreateDateColumn()
  created_at: Date;
}