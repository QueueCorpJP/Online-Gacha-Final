import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { GachaItem } from '../../gacha/entities/gacha-item.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => GachaItem)
  @JoinColumn({ name: 'itemId' })
  item: GachaItem;

  @Column()
  itemId: string;

  @Column({
    type: 'enum',
    enum: ['available', 'exchanged', 'locked', 'shipping', 'shipped'],
    default: 'available'
  })
  status: 'available' | 'exchanged' | 'locked' | 'shipping' | 'shipped';

  @Column({ default: false })
  isTraded: boolean;

  @CreateDateColumn()
  acquiredAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}