import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export type TransactionType = 'purchase' | 'usage' | 'earning' | 'shipping';

@Entity('coin_transactions')
export class CoinTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.coinTransactions)
  user!: User;

  @Column({ 
    type: 'enum', 
    enum: ['purchase', 'usage', 'earning', 'shipping'], 
    default: 'purchase' 
  })
  type!: TransactionType;

  @Column()
  amount!: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  paymentMethod?: string;

  @Column({ default: 'completed' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @CreateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  metadata?: string; // JSON string for additional transaction data
}
