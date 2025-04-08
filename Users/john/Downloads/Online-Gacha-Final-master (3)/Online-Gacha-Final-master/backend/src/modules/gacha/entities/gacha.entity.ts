import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { GachaItem } from './gacha-item.entity';
import { Category } from '../../category/entities/category.entity';
import { Favorite } from './favorite.entity';

interface LanguageContent {
  name: string;
  description: string;
}

interface Translations {
  ja: LanguageContent;
  en: LanguageContent;
  zh: LanguageContent;
}

@Entity('gachas')
export class Gacha {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  translations: Translations;

  @Column({
    type: 'enum',
    enum: ['normal', 'limited', 'special'],
    default: 'normal'
  })
  type: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer', nullable: true })
  period: number;

  @Column({ type: 'integer', nullable: true })
  dailyLimit: number;

  @Column({ nullable: true })
  thumbnail?: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => GachaItem, item => item.gacha, {
    cascade: true,
    eager: true
  })
  items: GachaItem[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'float', nullable: true })
  rating: number;

  @Column({ default: 0 })
  reviews: number;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  dislikes: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pricePerDraw: number;

  @Column({ type: 'integer', nullable: true })
  totalStock: number;

  @Column({ default: false })
  isOneTimeFreeEnabled: boolean;

  @ManyToOne(() => GachaItem, { nullable: true })
  @JoinColumn({ name: 'lastOnePrizeId' })
  lastOnePrize: GachaItem;

  @Column({ name: 'lastOnePrizeId', nullable: true })
  lastOnePrizeId: string;

  @Column({ type: 'integer', default: 50 })
  pityThreshold: number;

  @OneToMany(() => Favorite, favorite => favorite.gacha)
  favorites: Favorite[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods to get content in specific language
  getContent(language: keyof Translations): LanguageContent {
    return this.translations[language];
  }

  // Helper method to get name in specific language
  getName(language: keyof Translations): string {
    return this.translations[language].name;
  }

  // Helper method to get description in specific language
  getDescription(language: keyof Translations): string {
    return this.translations[language].description;
  }
}
