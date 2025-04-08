import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Gacha } from "./gacha.entity";

@Entity("gacha_pull_history")
export class GachaPullHistory {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: string;

    @Column()
    gachaId: string;

    @Column({ default: 0 })
    pullCount: number;

    @Column({ default: 0 })
    pullsSinceLastRare: number;

    @CreateDateColumn()
    lastPullAt: Date;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Gacha)
    gacha: Gacha;
}