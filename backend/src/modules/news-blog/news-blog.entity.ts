import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NewsBlogType {
  NEWS = 'news',           // ニュース
  EVENT = 'event',         // イベント情報
  CAMPAIGN = 'campaign',   // キャンペーン
  CARD_INFO = 'card-info', // カード情報
  OTHER = 'other'          // その他
}

@Entity('news_blog')
export class NewsBlog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: NewsBlogType,
    default: NewsBlogType.NEWS
  })
  type: NewsBlogType;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
