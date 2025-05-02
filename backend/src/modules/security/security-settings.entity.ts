import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SecuritySettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  ipRestriction: boolean;

  @Column({ default: true })
  logMonitoring: boolean;

  @Column()
  alertEmail: string;
}