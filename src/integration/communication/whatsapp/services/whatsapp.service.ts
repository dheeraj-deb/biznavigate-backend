// TODO: Implement whatsapp service logic

import { Injectable } from "@nestjs/common";
import { MessageHandler } from "../classes/message-handler";
import { PrismaService } from "src/prisma/prisma.service";

// {
//     SmsMessageSid: 'SM41e390ad270f5391f9fc666f78314b02',
//     NumMedia: '0',
//     ProfileName: '~',
//     MessageType: 'text',
//     SmsSid: 'SM41e390ad270f5391f9fc666f78314b02',
//     WaId: '919539192684',
//     SmsStatus: 'received',
//     Body: 'tets',
//     To: 'whatsapp:+14155238886',
//     NumSegments: '1',
//     ReferralNumMedia: '0',
//     MessageSid: 'SM41e390ad270f5391f9fc666f78314b02',
//     AccountSid: 'AC19fa060e5047f5af9b81450edc56838b',
//     From: 'whatsapp:+919539192684',
//     ApiVersion: '2010-04-01'
//   }

@Injectable()
export class WhatsappService {
  private session: Map<string, { sessionId: number; stepIndex: number }> =
    new Map();

  private userOnboardingSteps: {
    steps: {
      shop_name: { message: string; type: string; data: string };
      address: { message: string; type: string; data: string };
      gst_number: { message: string; type: string; data: string };
      mobile_num: { message: string; type: string; data: string };
      pan: { message: string; type: string; data: string };
      location: { message: string; type: string; data: string };
    };
  } = {
    steps: {
      shop_name: {
        message: "Please provide your shop name.",
        type: "text",
        data: "",
      },
      address: {
        message: "Please provide your shop address.",
        type: "text",
        data: "",
      },
      gst_number: {
        message: "Please provide your shop GSTIN.",
        type: "text",
        data: "",
      },
      mobile_num: {
        message: "Please provide your shop mobile number.",
        type: "text",
        data: "",
      },
      pan: {
        message: "Please provide your shop PAN number.",
        type: "text",
        data: "",
      },
      location: {
        message: "Please share your shop location.",
        type: "location",
        data: "",
      },
    },
  };

  constructor(
    private readonly MessageService: MessageHandler,
    private prisma: PrismaService
  ) {}

  async handleWebhook(body: any): Promise<string> {
    const { SmsStatus, Body, From, To } = body;
    if (SmsStatus === "received") {
      // console.log(`Received message from ${From} to ${To}: ${Body}`);
      // await this.MessageService.generateMessage(body);
      await this.createShop(body);
    }
    return "OK";
  }

  async createShop(body: any) {
    const { From, To, Body } = body;
    const phoneNumber = From.split(":")[1];

    try {
      const shop = await this.prisma.shops.findFirst({
        where: {
          mobile_num: phoneNumber,
        },
      });

      if (!shop) {
        if (this.session.has(phoneNumber)) {
          const session = this.session.get(phoneNumber);
          const stepIndex = session.stepIndex;
          this.userOnboardingSteps.steps[
            Object.keys(this.userOnboardingSteps.steps)[stepIndex]
          ].data = Body; // validate data
          const step = Object.keys(this.userOnboardingSteps.steps)[
            stepIndex + 1
          ];
          if (step) {
            this.session.set(phoneNumber, {
              sessionId: session.sessionId,
              stepIndex: stepIndex + 1,
            });

            //   call whatsapp api to send message
            await this.MessageService.sendMessage(
              From,
              To,
              this.userOnboardingSteps.steps[step].message,
              null,
              null
            )
              .then((message) => {
                // console.log("message", message);
              })
              .catch((err) => {
                console.log("err", err);
              });
          } else {
            console.log("session completed", this.userOnboardingSteps.steps);
            this.prisma.shops
              .create({
                data: {
                  shop_name: this.userOnboardingSteps.steps.shop_name.data,
                  address: this.userOnboardingSteps.steps.address.data,
                  gst_number: this.userOnboardingSteps.steps.gst_number.data,
                  mobile_num: this.userOnboardingSteps.steps.mobile_num.data,
                  pan: this.userOnboardingSteps.steps.pan.data,
                },
              })
              .then(async (createdShop) => {
                console.log("Shop created successfully:", createdShop);
                // Optionally, you can send a confirmation message
                await this.MessageService.sendMessage(
                  From,
                  To,
                  "Your shop has been created successfully!",
                  null,
                  null
                );
              })
              .catch((error) => {
                console.log("Error creating shop:", error);
              });
          }
        } else {
          const id = Math.random() * 1000000;
          this.session.set(phoneNumber, {
            sessionId: id,
            stepIndex: 0,
          });

          //   call whatsapp api to send message
          await this.MessageService.sendMessage(
            From,
            To,
            this.userOnboardingSteps.steps.shop_name.message,
            null,
            null
          )
            .then((message) => {
              // console.log("message", message);
            })
            .catch((err) => {
              console.log("err", err);
            });
        }
      }
    } catch (error) {
      console.log("error", error);
      throw new Error("Error creating shop");
    }
  }
}
