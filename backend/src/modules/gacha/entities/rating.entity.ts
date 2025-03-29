import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Gacha } from '../../gacha/entities/gacha.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gachaId: string;

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  @Column({ nullable: true })
  review?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Gacha)
  gacha: Gacha;
}
