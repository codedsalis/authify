import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '@authify/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@authify/common/guards/auth.guard';
import { RolesGuard } from '@authify/common/guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from '@authify/config/app.config';
import { EmailModule } from '@authify/email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './models/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    UserModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>('appConfig.jwt_secret'),
        signOptions: {
          expiresIn: config.get<string>('appConfig.jwt_token_duration'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
