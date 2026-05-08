import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { PrismaService } from "../../prisma/prisma.service";
import { WhatsAppApiClientService } from "../whatsapp/infrastructure/whatsapp-api-client.service";

/** Gupshup pipeline status from GET /partner/app/:appId/pipeline */
export interface GupshupPipelineStatus {
  status: string;
  whatsapp?: {
    countryCode: string;
    createdOn: number;
    creationStage: string;
    dialCode: string;
    embedStage: string;
    id: string;
    modifiedOn: number;
    pipeLineStage: string;
    uiFormStage: string;
    whatsappVerificationStatus: string;
  };
}

/** Options for the full TPP onboarding orchestration */
export interface TppOnboardingOptions {
  /** BizNavigate business_id */
  businessId: string;
  /** Name for the new Gupshup app (6-150 chars, no special chars) */
  appName: string;
  /** Live WABA ID returned from Meta Embedded Signup */
  wabaId: string;
  /** Phone number linked to the WABA (E.164 format) */
  phone: string;
  /** Optional callback URL Gupshup will use to send live-event notifications */
  callbackUrl?: string;
}

@Injectable()
export class GupshupOnboardingService {
  private readonly logger = new Logger(GupshupOnboardingService.name);
  private readonly baseUrl = "https://partner.gupshup.io";

  /** Master Gupshup app ID used for the platform-level webhook subscription */
  private readonly masterAppId: string;
  private readonly email: string;
  private readonly password: string;

  /** Cached master partner token */
  private cachedPartnerToken: string | null = null;
  private partnerTokenExpiresAt: number = 0;

  /** Cached master app token (for platform-level subscriptions) */
  private cachedMasterAppToken: string | null = null;
  private masterAppTokenExpiresAt: number = 0;

  private readonly configured: boolean;

  // Polling config for Step 3
  private readonly POLL_MAX_ATTEMPTS = 20;
  private readonly POLL_INTERVAL_MS = 30_000; // 30 s → 10 min total

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly metaApi: WhatsAppApiClientService,
  ) {
    this.masterAppId = this.config.get<string>("GUPSHUP_APP_ID") ?? "";
    this.email = this.config.get<string>("GUPSHUP_EMAIL") ?? "";
    this.password = this.config.get<string>("GUPSHUP_PASSWORD") ?? "";
    this.configured = !!(this.masterAppId && this.email && this.password);
    if (!this.configured) {
      this.logger.warn("Gupshup credentials not configured. Gupshup features will be disabled.");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE — Token helpers
  // ─────────────────────────────────────────────────────────────────────────────

  /** Returns a cached or freshly-fetched Gupshup partner (admin) token. */
  private async getPartnerToken(): Promise<string> {
    if (this.cachedPartnerToken && Date.now() < this.partnerTokenExpiresAt - 5 * 60 * 1000) {
      return this.cachedPartnerToken;
    }

    const params = new URLSearchParams();
    params.append("email", this.email);
    params.append("password", this.password);

    const { data } = await axios.post(
      `${this.baseUrl}/partner/account/login`,
      params,
      { headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" } },
    );

    if (!data.token) {
      throw new InternalServerErrorException("Failed to authenticate with Gupshup");
    }

    this.cachedPartnerToken = data.token;
    this.partnerTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    return this.cachedPartnerToken;
  }

  /**
   * Returns the **master** app token (for the platform's own Gupshup app).
   * This is used only for the master webhook subscription on startup.
   * For per-WABA apps, use `getPartnerAppToken(appId)` instead.
   */
  private async getMasterAppToken(): Promise<string> {
    if (this.cachedMasterAppToken && Date.now() < this.masterAppTokenExpiresAt - 5 * 60 * 1000) {
      return this.cachedMasterAppToken;
    }

    const partnerToken = await this.getPartnerToken();

    const { data } = await axios.get(
      `${this.baseUrl}/partner/app/${this.masterAppId}/token`,
      { headers: { token: partnerToken } },
    );

    if (!data.token?.token) {
      throw new InternalServerErrorException("Failed to get Gupshup master app token");
    }

    this.cachedMasterAppToken = data.token.token;
    this.masterAppTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    return this.cachedMasterAppToken;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MASTER APP — Platform-level webhook subscription (called once on startup)
  // ─────────────────────────────────────────────────────────────────────────────

  /** Subscribe the platform's master Gupshup app to webhooks. Called on startup. */
  async subscribeWebhook(): Promise<any> {
    const appToken = await this.getMasterAppToken();
    const backendUrl = this.config.getOrThrow<string>("BACKEND_URL");
    const webhookUrl = `${backendUrl}/whatsapp/gupshup/webhook`;

    const params = new URLSearchParams();
    params.append("modes", "MESSAGE,SENT,DELIVERED,READ,FAILED,OTHERS,FLOWS_MESSAGE");
    params.append("tag", "BizNavigate-V3");
    params.append("url", webhookUrl);
    params.append("version", "3");
    params.append("showOnUI", "false");

    const { data } = await axios.post(
      `${this.baseUrl}/partner/app/${this.masterAppId}/subscription`,
      params,
      { headers: { Authorization: appToken, "Content-Type": "application/x-www-form-urlencoded" } },
    );

    if (data.status !== "success") {
      throw new InternalServerErrorException(data.message ?? "Failed to subscribe master webhook");
    }

    return data.subscription;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TPP STEPS 1-4 — Tech Partner Hosted Embed Signup orchestration
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Step 1 — Link WABA App
   * Creates a new Gupshup app, maps the WABA, attaches the credit line, and
   * optionally sets a live-event callback URL.
   *
   * @returns Gupshup app UUID (appId)
   */
  async createGupshupApp(
    name: string,
    wabaId: string,
    phone: string,
    callbackUrl?: string,
  ): Promise<{ appId: string }> {
    const partnerToken = await this.getPartnerToken();

    const params = new URLSearchParams({ name, wabaId, phone });
    if (callbackUrl) params.append("callbackUrl", callbackUrl);

    this.logger.log(`[Step 1] Creating Gupshup TPP app: name=${name} wabaId=${wabaId} phone=${phone}`);

    let res: any;
    try {
      res = await axios.post(
        `${this.baseUrl}/partner/tpp/app`,
        params,
        {
          headers: {
            // Gupshup TPP API expects the raw partner token (no "Bearer" prefix)
            Authorization: partnerToken,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
    } catch (error) {
      const msg = error?.response?.data?.message ?? error.message;

      // Handle idempotency: if app already exists for this phone, extract the appId
      // Example: "App a97d8ef4-cb00-4c2e-ac5c-aa2401626d94 already exists with phone 919567907298"
      const match = msg.match(/App ([a-f0-9\-]+) already exists/i);
      if (match && match[1]) {
        const existingAppId = match[1];
        this.logger.log(`[Step 1] App already exists, using existing appId=${existingAppId}`);

        // Re-attempt callback URL registration in case it failed on first creation
        if (callbackUrl) {
          try {
            const callbackParams = new URLSearchParams({ callbackUrl });
            await axios.put(
              `${this.baseUrl}/partner/app/${existingAppId}`,
              callbackParams,
              { headers: { Authorization: partnerToken, "Content-Type": "application/x-www-form-urlencoded" } },
            );
            this.logger.log(`[Step 1] Callback URL updated for existing appId=${existingAppId}`);
          } catch (cbErr) {
            this.logger.warn(`[Step 1] Could not update callback URL for appId=${existingAppId}: ${cbErr?.response?.data?.message ?? cbErr.message}`);
          }
        }

        return { appId: existingAppId };
      }

      this.logger.error(`[Step 1] createGupshupApp failed: ${msg}`);
      throw new InternalServerErrorException(`Gupshup Step 1 failed: ${msg}`);
    }

    const data = res.data;
    if (data.status !== "success" || !data.appId) {
      throw new InternalServerErrorException(`Gupshup Step 1 error: ${data.message ?? "Unknown error"}`);
    }

    this.logger.log(`[Step 1] App created successfully: appId=${data.appId}`);
    return { appId: data.appId };
  }

  /**
   * Step 2 — Get Partner App Token
   * Fetches the per-WABA app token using the master partner token.
   * This token is scoped to the newly created Gupshup app.
   */
  async getPartnerAppToken(appId: string): Promise<string> {
    const partnerToken = await this.getPartnerToken();

    this.logger.log(`[Step 2] Fetching partner app token for appId=${appId}`);

    const { data } = await axios.get(
      `${this.baseUrl}/partner/app/${appId}/token`,
      { headers: { Authorization: partnerToken } },
    );

    if (!data.token?.token) {
      throw new InternalServerErrorException(`Gupshup Step 2 failed: Could not get partner app token for appId=${appId}`);
    }

    this.logger.log(`[Step 2] Partner app token obtained for appId=${appId}`);
    return data.token.token as string;
  }

  /**
   * Step 3 — Get Pipeline Status
   * Returns the current provisioning stage of the Gupshup app.
   * Use `creationStage === "WHATSAPP_PROVISIONING_DONE"` for success.
   */
  async getPipelineStatus(appId: string, partnerAppToken: string): Promise<GupshupPipelineStatus> {
    const { data } = await axios.get(
      `${this.baseUrl}/partner/app/${appId}/pipeline`,
      { headers: { Authorization: partnerAppToken } },
    );
    return data as GupshupPipelineStatus;
  }

  /**
   * Step 4 — Subscribe Per-App Webhook
   * Subscribes the **newly created per-WABA app** (not the master app) to receive
   * WhatsApp message events on your backend webhook.
   */
  async subscribeAppWebhook(appId: string, partnerAppToken: string): Promise<any> {
    const backendUrl = this.config.getOrThrow<string>("BACKEND_URL");
    const webhookUrl = `${backendUrl}/whatsapp/gupshup/webhook`;

    const params = new URLSearchParams();
    params.append("modes", "MESSAGE,SENT,DELIVERED,READ,FAILED,OTHERS,FLOWS_MESSAGE");
    params.append("tag", "BizNavigate-V3");
    params.append("url", webhookUrl);
    params.append("version", "3");
    params.append("showOnUI", "false");

    this.logger.log(`[Step 4] Subscribing webhook for appId=${appId} → ${webhookUrl}`);

    const { data } = await axios.post(
      `${this.baseUrl}/partner/app/${appId}/subscription`,
      params,
      { headers: { Authorization: partnerAppToken, "Content-Type": "application/x-www-form-urlencoded" } },
    );

    if (data.status !== "success") {
      throw new InternalServerErrorException(`Gupshup Step 4 failed: ${data.message ?? "Webhook subscription failed"}`);
    }

    this.logger.log(`[Step 4] Webhook subscribed for appId=${appId}`);
    return data.subscription;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PIPELINE POLLING — Step 3 long-running check
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Polls the Gupshup pipeline until the app reaches WHATSAPP_PROVISIONING_DONE
   * or exhausts the retry budget. On success, auto-subscribes the webhook (Step 4)
   * and marks the social_account as live.
   *
   * This is designed to run **asynchronously** (fire-and-background) so the
   * initial onboarding API response is not blocked.
   */
  async pollUntilLive(appId: string, partnerAppToken: string, businessId: string): Promise<void> {
    this.logger.log(`[Polling] Starting pipeline poll for appId=${appId} businessId=${businessId}`);

    for (let attempt = 1; attempt <= this.POLL_MAX_ATTEMPTS; attempt++) {
      try {
        const result = await this.getPipelineStatus(appId, partnerAppToken);
        console.log("result", result);
        const stage = result.whatsapp?.creationStage;
        const pipeline = result.whatsapp?.pipeLineStage;

        this.logger.log(`[Polling ${attempt}/${this.POLL_MAX_ATTEMPTS}] appId=${appId} creationStage=${stage} pipelineStage=${pipeline}`);

        // Gupshup TPP apps can reach "live" with either:
        //   a) creationStage=WHATSAPP_PROVISIONING_DONE (standard path)
        //   b) pipelineStage=FINALIZE + uiFormStage=ONBOARDING_COMPLETED (TPP embedded path)
        const uiForm = result.whatsapp?.uiFormStage;
        const isLive =
          stage === "WHATSAPP_PROVISIONING_DONE" ||
          (pipeline === "FINALIZE" && uiForm === "ONBOARDING_COMPLETED");

        if (isLive) {
          // ✅ App is live — subscribe webhook then mark account active
          try {
            await this.subscribeAppWebhook(appId, partnerAppToken);
          } catch (subErr) {
            this.logger.error(`[Polling] Webhook subscription failed for appId=${appId}: ${subErr.message}`);
            // Non-fatal — account will still be marked live
          }

          await this.prisma.social_accounts.updateMany({
            where: { gupshup_app_id: appId, business_id: businessId },
            data: { gupshup_app_status: "live", is_active: true, updated_at: new Date() },
          });

          this.logger.log(`[Polling] ✅ App ${appId} is live! Account activated for business=${businessId}`);

          // Non-blocking: fetch Meta business verification status
          const liveAccount = await this.prisma.social_accounts.findFirst({
            where: { gupshup_app_id: appId, business_id: businessId },
            select: { account_id: true, instagram_business_account_id: true },
          });
          if (liveAccount?.instagram_business_account_id) {
            setImmediate(() => this.fetchMetaVerificationStatus(
              liveAccount.account_id,
              liveAccount.instagram_business_account_id,
            ));
          }

          return;
        }

        if (stage === "ERROR") {
          // ❌ Pipeline failed (retried 3× by Gupshup already)
          await this.prisma.social_accounts.updateMany({
            where: { gupshup_app_id: appId, business_id: businessId },
            data: { gupshup_app_status: "error", updated_at: new Date() },
          });
          this.logger.error(`[Polling] ❌ Pipeline error for appId=${appId}`);
          return;
        }
      } catch (err) {
        this.logger.error(`[Polling] Error on attempt ${attempt} for appId=${appId}: ${err.message}`);
      }

      // Wait before next poll (skip wait on last attempt)
      if (attempt < this.POLL_MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, this.POLL_INTERVAL_MS));
      }
    }

    this.logger.warn(`[Polling] ⏰ Timed out waiting for appId=${appId} to go live after ${this.POLL_MAX_ATTEMPTS} attempts`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN ORCHESTRATOR — completeTppOnboarding (Steps 1 → 2 → 3 + 4)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Full TPP onboarding flow:
   *   Step 1 — Link App (create Gupshup app, map WABA)
   *   Step 2 — Get Partner App Token
   *   Step 3 + 4 — Poll pipeline → auto-subscribe webhook when live (async)
   *
   * Returns immediately after Step 2 so the API response is fast.
   * Steps 3 & 4 continue in the background.
   */
  async completeTppOnboarding(opts: TppOnboardingOptions): Promise<{ gupshupAppId: string }> {
    const { businessId, appName, wabaId, phone, callbackUrl } = opts;

    // Sanitize app name for Gupshup: 6-150 chars, alphanumeric only
    let safeName = appName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (safeName.length < 6) safeName = safeName.padEnd(6, 'abc123');
    const finalAppName = `${safeName}${businessId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5)}`.substring(0, 150);

    // Sanitize phone number for Gupshup: remove spaces, dashes, parens
    const finalPhone = phone.replace(/[\s\-\(\)]/g, '');

    // ── Step 1: Link app ──────────────────────────────────────────────────────
    const { appId: gupshupAppId } = await this.createGupshupApp(finalAppName, wabaId, finalPhone, callbackUrl);

    // Persist the Gupshup app ID and mark as pending
    await this.prisma.social_accounts.updateMany({
      where: { business_id: businessId, platform: "whatsapp" },
      data: {
        gupshup_app_id: gupshupAppId,
        gupshup_app_status: "pending",
        is_active: false,
        updated_at: new Date(),
      },
    });

    // ── Step 2: Get per-app token ─────────────────────────────────────────────
    const partnerAppToken = await this.getPartnerAppToken(gupshupAppId);

    // ── Steps 3 + 4: Poll + subscribe (non-blocking background task) ──────────
    this.pollUntilLive(gupshupAppId, partnerAppToken, businessId).catch((err) =>
      this.logger.error(`Background poll failed for appId=${gupshupAppId}: ${err.message}`),
    );

    this.logger.log(`completeTppOnboarding initiated. appId=${gupshupAppId} businessId=${businessId}`);
    return { gupshupAppId };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LIVE EVENT HANDLER — called by the webhook controller when Gupshup fires
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Handles the Gupshup "docker-status-event" live payload.
   * If the WABA app is now live, subscribes the webhook and activates the account.
   * Use this as an alternative to polling (event-driven).
   */
  async handleLiveEvent(payload: { appId?: string; phone?: string; waId?: string }): Promise<void> {
    const { appId, phone, waId } = payload;
    const phoneToMatch = waId || phone;

    this.logger.log(`[LiveEvent] Received live event: appId=${appId} phone=${phoneToMatch}`);

    // Find the account by gupshup_app_id or by phone number
    const account = await this.prisma.social_accounts.findFirst({
      where: appId
        ? { gupshup_app_id: appId }
        : { platform: "whatsapp", platform_user_id: phoneToMatch },
    });

    if (!account) {
      this.logger.warn(`[LiveEvent] No social_account found for appId=${appId} phone=${phoneToMatch}`);
      return;
    }

    if (account.gupshup_app_status === "live") {
      this.logger.log(`[LiveEvent] Account ${account.account_id} already live, skipping`);
      return;
    }

    const resolvedAppId = appId || account.gupshup_app_id;
    if (!resolvedAppId) {
      this.logger.warn(`[LiveEvent] No gupshup_app_id found for account ${account.account_id}`);
      return;
    }

    try {
      const partnerAppToken = await this.getPartnerAppToken(resolvedAppId);
      await this.subscribeAppWebhook(resolvedAppId, partnerAppToken);
    } catch (err) {
      this.logger.error(`[LiveEvent] Webhook subscription failed: ${err.message}`);
    }

    await this.prisma.social_accounts.update({
      where: { account_id: account.account_id },
      data: { gupshup_app_status: "live", is_active: true, updated_at: new Date() },
    });

    this.logger.log(`[LiveEvent] ✅ Account ${account.account_id} (business=${account.business_id}) marked live`);

    if (account.instagram_business_account_id) {
      setImmediate(() => this.fetchMetaVerificationStatus(
        account.account_id,
        account.instagram_business_account_id,
      ));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC UTILITIES
  // ─────────────────────────────────────────────────────────────────────────────

  /** Fetch the current pipeline status for a given Gupshup app ID (for the status endpoint). */
  async getStatusForApp(appId: string): Promise<GupshupPipelineStatus> {
    const partnerAppToken = await this.getPartnerAppToken(appId);
    return this.getPipelineStatus(appId, partnerAppToken);
  }

  /** Fetch details of a Gupshup-onboarded app by its Gupshup app UUID. */
  async getOnboardedClientDetails(gupshupAppId: string): Promise<{
    gupshupAppId: string;
    phone: string;
    name: string;
    live: boolean;
  }> {
    const partnerToken = await this.getPartnerToken();

    const { data } = await axios.get(
      `${this.baseUrl}/partner/app/${gupshupAppId}/details`,
      { headers: { token: partnerToken } },
    );

    if (data.status !== "success" || !data.appDetails) {
      throw new InternalServerErrorException("Failed to fetch app details from Gupshup");
    }

    const app = data.appDetails;
    return {
      gupshupAppId: app.id,
      phone: app.phone,
      name: app.name,
      live: app.live,
    };
  }

  private async fetchMetaVerificationStatus(accountId: string, wabaId: string): Promise<void> {
    try {
      const details = await this.metaApi.getBusinessAccountDetails(wabaId);
      await this.prisma.social_accounts.update({
        where: { account_id: accountId },
        data: {
          meta_account_review_status: details.account_review_status ?? null,
          meta_verification_checked_at: new Date(),
        },
      });
      this.logger.log(`[Verification] Stored Meta review status for account ${accountId}: ${details.account_review_status}`);
    } catch (err) {
      this.logger.warn(`[Verification] Could not fetch Meta verification status for account ${accountId}: ${err.message}`);
    }
  }

  /** Generate an Embedded Signup link (Gupshup-hosted flow, kept for backwards compat). */
  async generateEmbedLink(user: string, lang: string, regenerate = false): Promise<string> {
    const partnerToken = await this.getPartnerToken();
    const url = `${this.baseUrl}/partner/app/${this.masterAppId}/onboarding/embed/link`;

    const { data } = await axios.get(url, {
      headers: { token: partnerToken },
      params: { user, lang, regenerate },
    });

    if (data.status !== "success") {
      throw new InternalServerErrorException(data.message ?? "Failed to generate embed link");
    }

    return data.link as string;
  }

  /**
   * Legacy: Complete onboarding using Gupshup's own app details API.
   * Kept for backwards compatibility with existing flows.
   */
  async completeOnboarding(businessId: string): Promise<{ accountId: string; phoneNumber: string }> {
    const details = await this.getOnboardedClientDetails(businessId);
    const { name, phone } = details;

    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 60);

    const existing = await this.prisma.social_accounts.findFirst({
      where: { business_id: businessId, platform: "whatsapp", platform_user_id: phone },
    });

    let account: any;
    if (existing) {
      account = await this.prisma.social_accounts.update({
        where: { account_id: existing.account_id },
        data: { username: name, page_id: phone, access_token: "", token_expiry: tokenExpiry, is_active: true, updated_at: new Date() },
      });
    } else {
      account = await this.prisma.social_accounts.create({
        data: {
          business_id: businessId,
          platform: "whatsapp",
          platform_user_id: phone,
          username: name,
          page_id: phone,
          access_token: "",
          token_expiry: tokenExpiry,
          is_active: true,
        },
      });
    }

    this.logger.log(`WhatsApp account saved for business=${businessId} phone=${phone}`);
    return { accountId: account.account_id, phoneNumber: phone };
  }

}
