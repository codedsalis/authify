import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@authify/common/base.entity';
import { User } from './user.entity';

@Entity({ name: 'password_reset_tokens' })
export class PasswordResetToken extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  token: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'verified_at', type: 'datetime', nullable: true })
  verifiedAt: Date;
}
