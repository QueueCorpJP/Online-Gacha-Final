import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Entity('prizes')
export class Prize {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @ManyToOne(() => User)
  user!: User;

  @Column()
  name!: string;

  @Column({ nullable: true })
  image!: string;

  @Column({
    type: 'enum',
    enum: ['Pending Selection', 'Awaiting Shipment', 'Shipped'],
    default: 'Pending Selection',
  })
  status?: string;

  @Column({ default: false })
  isConvertedToCoins?: boolean;

  @Column({ nullable: true })
  shippingAddress?: string;
}
