import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
import { Twilio } from "twilio";

@Injectable()
export class MessageHandler {
  private accountSid: string;
  private authToken: string;
  private client: Twilio;
  
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.accountSid = this.configService.get<string>("twilio.sid");
    this.authToken = this.configService.get<string>("twilio.authToken");
    this.client = new Twilio(this.accountSid, this.authToken);
  }

  private async fetchTemplates(
    templateKey: string,
    lang: string
  ): Promise<{ sid: string; key: string; variables: Object }> {
    try {
      const template = await this.prisma.whatsapp_templates.findFirst({
        where: {
          key: templateKey,
          language: lang,
        },
      });

      return template;
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendMessage(to: string, from: string, body: string, contentSid: string, contentVariables: any) {
    return this.client.messages.create({ to, from, body, contentSid, contentVariables });
  }

  async generateMessage(body: any) {
    const { SmsStatus, Body, From, To } = body;
    try {
      const template = await this.fetchTemplates("welcome_template", "en");
      console.log("template", template);
      const variable = JSON.stringify(
        Object.fromEntries(
          Object.entries(template.variables).map(([key, value]) => {
            return [
              key,
              value
                .replace("{{user_name}}", "Dheeraj")
                .replace("{{provider_name}}", "Biznavigate"),
            ];
          })
        )
      );

      //   console.log("variable", variable);

      await this.sendMessage(From, To, null, template.sid, variable)
        .then((message) => {
          //   console.log("message", message);
        })
        .catch((err) => {
          console.log("err", err);
        });
    } catch (error) {
      console.log("error", error);
    }
  }




}
