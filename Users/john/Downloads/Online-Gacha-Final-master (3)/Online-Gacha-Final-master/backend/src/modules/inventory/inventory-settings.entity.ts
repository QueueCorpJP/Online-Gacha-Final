import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class InventorySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 10 })
  globalThreshold: number;

  @Column({ type: 'varchar', default: 'email' })
  notificationMethod: string;

  @Column({ type: 'boolean', default: true })
  realTimeUpdates: boolean;
}
