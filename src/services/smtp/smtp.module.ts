import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { SmtpService } from './smtp.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST as string,
        port: Number(process.env.SMTP_PORT as string),
        secure: (process.env.SMTP_USE_SSL as string) === 'true',
        auth: {
          user: process.env.SMTP_USER_LOGIN as string,
          pass: process.env.SMTP_USER_PASSWORD as string,
        },
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [SmtpService],
  exports: [SmtpService],
})
export class SmtpModule {}
