import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column()
  amount: number;

  @Column()
  coins: number;

  @Column()
  method: 'stripe' | 'paypay';

  @Column()
  status: string;

  @Column({ nullable: true })
  stripePaymentIntentId?: string;

  @Column({ nullable: true })
  payPayPaymentId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  completedAt?: Date;
}
