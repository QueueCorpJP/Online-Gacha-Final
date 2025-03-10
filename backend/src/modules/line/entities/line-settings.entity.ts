import { Entity, Column, PrimaryColumn, OneToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('line_settings')
export class LineSettings {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @Column({ nullable: true })
  lineUserId: string;

  @Column({ default: false })
  isConnected: boolean;

  @Column({ default: false })
  notifications: boolean;

  @OneToOne(() => User, user => user.lineSettings)
  user?: User;
}
