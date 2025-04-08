import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../user/entities/user.entity';

export enum InquiryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  subject!: string;

  @Column()
  message!: string;

  @Column({ 
    type: 'enum', 
    enum: InquiryStatus, 
    default: InquiryStatus.PENDING 
  })
  status: InquiryStatus;

  @CreateDateColumn()
  createdAt: Date;
}
