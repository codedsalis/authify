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
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get<string>('DB_PATH'),
        autoLoadEntities: true,
        synchronize: true,
        logging:
          configService.get<string>('appConfig.environment') ===
            'development' && true,
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
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redisConfig.host'),
          port: configService.get<number>('redisConfig.port'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
