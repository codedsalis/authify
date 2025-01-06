import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { EmailModule } from '@authify/email/email.module';
import { PasswordResetToken } from './models/password_reset_token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PasswordResetToken]), EmailModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
