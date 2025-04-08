import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, DeleteDateColumn } from 'typeorm';
import { Gacha } from './gacha.entity';

export enum RarityType {
  S = 'S',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D'
}

@Entity()
export class GachaItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: RarityType
  })
  rarity: RarityType;

  @Column('decimal', { precision: 5, scale: 2 })
  probability: number;

  @Column({ nullable: true })
  stock?: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column('decimal', { precision: 5, scale: 2, default: 1.00 })
  exchangeRate: number;

  @ManyToOne(() => Gacha, gacha => gacha.items)
  gacha: Gacha;

  @DeleteDateColumn()
  deletedAt?: Date;
}
