import { BaseEntity } from '@authify/common/base.entity';
import { User } from '@authify/user/models/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  token: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;
}
