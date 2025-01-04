import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { BullModule } from '@nestjs/bullmq';
import { EmailConsumer } from './email.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailService, EmailConsumer],
  controllers: [],
  exports: [EmailService],
})
export class EmailModule {}
