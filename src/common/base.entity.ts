import { Exclude } from 'class-transformer';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  @Exclude()
  updatedAt: string;
}
