import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../user/entities/user.entity';

export enum NotificationType {
  LINE = 'LINE',
  IN_APP = 'In-App',
  EMAIL = 'Email',
  PUSH = 'Push'
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.IN_APP
  })
  type: NotificationType;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'notification_reads',
    joinColumn: {
      name: 'notificationId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id'
    }
  })
  readByUsers: User[];

  @Column({ default: false })
  isGlobal: boolean;

  @Column('text', { array: true, nullable: true })
  targetUserIds: string[];
}
