import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { CoinTransaction } from '../../coin/entities/coin-transaction.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { UserRole } from '../../../common/enums/user-roles.enum';
import { Prize } from '../../prizes/prize.entity';
import { LineSettings } from 'src/modules/line/entities/line-settings.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  INACTIVE = 'INACTIVE'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ 
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.USER]
  })
  roles!: UserRole[];

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: 0 })
  coinBalance!: number;

  @Column({ 
    type: 'enum', 
    enum: UserStatus,
    default: UserStatus.INACTIVE 
  })
  status!: UserStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => CoinTransaction, (transaction) => transaction.user)
  coinTransactions?: CoinTransaction[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments?: Payment[];

  @Column({ nullable: true })
  referralCode?: string;

  @Column({ nullable: true })
  referredBy?: string;

  // @OneToMany(() => Prize, (prize) => prize.user)
  // prizes!: Prize[];

  @Column({ default: 0 })
  pointsBalance!: number;

  @Column({ type: 'timestamp', nullable: true })
  pointsLastUpdated?: Date;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @OneToOne(() => LineSettings, lineSettings => lineSettings.user, { cascade: true })
  lineSettings: LineSettings;
}

