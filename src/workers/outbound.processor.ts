// src/workers/outbound.processor.ts
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { getRedis } from "../utils/redis";
import { readFileSync } from "fs";
import * as path from "path";
import { Twilio } from "twilio";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";

const DEFAULT_MPS = parseInt(process.env.SENDER_MPS || "30", 10); // conservative default
const BUCKET_CAPACITY = DEFAULT_MPS * 2;

@Processor("outbound-messages")
export class OutboundProcessor extends WorkerHost {
  private readonly logger = new Logger(OutboundProcessor.name);
  private redis = getRedis();
  private luaScriptSha?: string;
  private twilio?: Twilio;

  constructor(
    private config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super();
    // init Twilio client
    const sid = this.config.get<string>("TWILIO_SID");
    const token = this.config.get<string>("TWILIO_AUTH_TOKEN");
    if (sid && token) this.twilio = new Twilio(sid, token);

    // load lua script
    const lua = readFileSync(
      path.join(process.cwd(), "src", "utils", "tokenBucket.lua"),
      "utf8"
    );
    this.redis
      .script("LOAD", lua)
      .then((sha) => {
        this.luaScriptSha = sha as string;
        this.logger.log("Loaded tokenBucket.lua sha=" + sha);
      })
      .catch((e) => {
        this.logger.error(
          "Failed to load Lua token-bucket script",
          e?.message ?? e
        );
      });
  }

  private async tryAcquireToken(
    bucketKey: string,
    tokens = 1
  ): Promise<boolean> {
    if (!this.luaScriptSha) {
      // fallback naive approach: simple rate gating using INCR with expiry (coarse)
      const key = `outbound:basic:${bucketKey}`;
      const v = await this.redis.incr(key);
      if (v === 1) {
        await this.redis.expire(key, 1);
      }
      return v <= DEFAULT_MPS;
    }
    const now = Date.now();
    try {
      const res = await this.redis.evalsha(
        this.luaScriptSha,
        1,
        `outbound:bucket:${bucketKey}`,
        BUCKET_CAPACITY,
        DEFAULT_MPS,
        now,
        tokens
      );
      return res === 1;
    } catch (e) {
      this.logger.warn(
        "Lua token bucket failed, falling back",
        e?.message ?? e
      );
      // fallback: deny to be safe
      return false;
    }
  }

  async process(job: Job) {
    const { to, from, data, inboundRef } = job.data;
    const senderKey = String(from);

    // Try for limited number of loops to get tokens (simple backoff)
    let attempts = 0;
    const maxAttempts = 20;
    while (!(await this.tryAcquireToken(senderKey, 1))) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error("Rate limiter busy");
      }
      await new Promise((r) => setTimeout(r, 200)); // 200ms backoff
    }

    try {
      // Build message options for Twilio (adapt if you use Meta Cloud API)
      // Get configured Twilio WhatsApp number
      const twilioWhatsAppNumber = this.config.get<string>("TWILIO_PHONE_NUMBER");

      // Format phone numbers for WhatsApp API
      // Use configured Twilio number instead of 'from' parameter
      const formattedFrom = twilioWhatsAppNumber?.startsWith('whatsapp:')
        ? twilioWhatsAppNumber
        : `whatsapp:${twilioWhatsAppNumber}`;
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      this.logger.log(`Sending from ${formattedFrom} to ${formattedTo}`);

      const opts: any = {
        from: formattedFrom,
        to: formattedTo,
        body: data.message,
      };
      if (data.contentSid) opts.contentSid = data.contentSid;
      if (data.contentVariables) opts.contentVariables = data.contentVariables;
      if (data.mediaUrls) opts.mediaUrl = data.mediaUrls;

      if (!this.twilio) {
        throw new Error("Twilio not configured");
      }

      const res = await this.twilio.messages.create(opts);

      //   persist outbound record (prisma table names from schema below)
      await this.prisma.whatsappMessage
        .create({
          data: {
            messageSid: res.sid,
            refInboundSid: inboundRef ?? undefined,
            to,
            from,
            body: data.message,
            providerResponse: res,
            direction: "OUTBOUND",
            sentAt: new Date(),
          },
        })
        .catch((e) =>
          this.logger.warn("Persist outbound failed", e?.message ?? e)
        );

      this.logger.log(`Sent message sid=${res.sid} to=${to}`);
      return { ok: true };
    } catch (err) {
      this.logger.error("Failed outbound send", err?.message ?? err);
      throw err; // allow retries
    }
  }
}
