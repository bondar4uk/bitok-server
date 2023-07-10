import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { RequestDataManager } from '../requestDataManager/requestDataManager';
import { LoggerService } from '../logger/logger.service';
import { RESPONSE_MESSAGE } from '../../constants/responses';

@Injectable()
export class SmtpService {
  private readonly _from: string;
  private readonly _subject: string;

  static LOG = LoggerService.loadCustomConfiguration(
    LoggerService.moduleNameValidate('Smtp'),
  );

  constructor(private mailerService: MailerService) {
    const from = (process.env.SMTP_TEMPLATE_FROM as string).split('_');
    this._from = from[0] + (process.env.SMTP_USER_LOGIN as string) + from[1];
    this._subject = process.env.SMTP_TEMPLATE_SUBJECT as string;
  }

  async SendMail(emails: string | string[], template: string, context: any) {
    try {
      const list: string[] = RequestDataManager.messageConvert(emails);
      await Promise.all(
        list.map(async (email: string) => {
          await this.mailerService.sendMail({
            to: email,
            from: this._from,
            subject: this._subject,
            template,
            context,
          });
        }),
      );
      SmtpService.LOG.information(RESPONSE_MESSAGE.EMAIL_SENT_SUCCESSFULLY());
      return RequestDataManager.ok({
        message: RESPONSE_MESSAGE.EMAIL_SENT_SUCCESSFULLY(),
      });
    } catch (e: any) {
      console.log(e);
      return RequestDataManager.internalServerError();
    }
  }
}
