import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  usedBy?: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}