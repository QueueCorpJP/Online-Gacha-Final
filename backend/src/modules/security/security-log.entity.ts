import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum SecurityEventType {
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  SUSPICIOUS_IP = 'SUSPICIOUS_IP',
  ADMIN_ACTION = 'ADMIN_ACTION'
}

@Entity()
export class SecurityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SecurityEventType
  })
  event: SecurityEventType;

  @Column()
  ip: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  details?: string;
}
