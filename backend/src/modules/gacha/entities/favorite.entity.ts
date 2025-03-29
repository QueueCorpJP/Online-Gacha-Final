import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Gacha } from './gacha.entity';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  gachaId: string;

  @Column({ type: 'enum', enum: ['like', 'dislike'], default: 'like' })
  type: 'like' | 'dislike';

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Gacha, gacha => gacha.favorites)
  gacha: Gacha;
}
