import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { Role } from '@authify/common/enums/role.enum';
import { BaseEntity } from '@authify/common/base.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({
    name: 'roles',
    type: 'json',
    nullable: true,
    default: JSON.stringify([Role.User]),
  })
  roles: Role[];
}
