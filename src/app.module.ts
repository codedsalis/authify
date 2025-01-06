import { Module } from '@nestjs/common';
import { AuthModule } from '@authify/auth/auth.module';
import { UserModule } from '@authify/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '@authify/email/email.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { mailerConfig } from './config/mailer.config';
import redisConfig from '@authify/config/redis.config';
import appConfig from '@authify/config/app.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          load: [appConfig, redisConfig],
          isGlobal: true,
        }),
      ],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DB_PATH'),
        autoLoadEntities: true,
        synchronize: true,
        logging:
          config.get<string>('appConfig.environment') === 'development' && true,
      }),
    }),
    MailerModule.forRoot(mailerConfig),
    BullModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          load: [redisConfig],
          isGlobal: true,
        }),
      ],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redisConfig.host'),
          port: config.get<number>('redisConfig.port'),
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        limit: 10,
        ttl: 60,
      },
    ]),
    BullModule.registerQueue({
      name: 'email',
    }),
    EmailModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
