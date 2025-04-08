import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column({ default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;
}