import { Module } from '@nestjs/common';
import { MailController } from 'src/controller/mailer.controller';
import { MailService } from 'src/service/mailer.service';

@Module({
  controllers: [MailController],
  providers:[MailService]
})
export class MailerModule {}