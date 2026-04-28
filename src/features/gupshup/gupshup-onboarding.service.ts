import { Injectable, InternalServerErrorException, Logger, OnModuleInit, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { PrismaService } from "../../prisma/prisma.service";

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
export class GupshupOnboardingService implements OnApplicationBootstrap {
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
  private static bootstrapDone = false;

  // Polling config for Step 3
  private readonly POLL_MAX_ATTEMPTS = 20;
  private readonly POLL_INTERVAL_MS = 30_000; // 30 s → 10 min total
  private readonly STUCK_THRESHOLD = 3; // consecutive INITIAL polls before marking stuck

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.masterAppId = this.config.get<string>("GUPSHUP_APP_ID") ?? "";
    this.email = this.config.get<string>("GUPSHUP_EMAIL") ?? "";
    this.password = this.config.get<string>("GUPSHUP_PASSWORD") ?? "";
    this.configured = !!(this.masterAppId && this.email && this.password);
    if (!this.configured) {
      this.logger.warn("Gupshup credentials not configured. Gupshup features will be disabled.");
    }
  }



  /**
   * On startup, auto-retry any WhatsApp accounts that are stuck or pending
   * without a running poll (e.g. from a previous server restart).
   */
  async onApplicationBootstrap() {
    if (!this.configured || GupshupOnboardingService.bootstrapDone) return;
    GupshupOnboardingService.bootstrapDone = true;

    try {
      // Backfill page_id (Gupshup app name) for accounts that are missing it
      const accountsMissingAppName = await this.prisma.social_accounts.findMany({
        where: { platform: "whatsapp", gupshup_app_id: { not: null }, page_id: null },
      });
      if (accountsMissingAppName.length > 0) {
        try {
          const apps = await this.listApps();
          for (const acc of accountsMissingAppName) {
            const match = apps.find((a: any) => (a.id ?? a.appId) === acc.gupshup_app_id);
            if (match?.name) {
              await this.prisma.social_accounts.update({
                where: { account_id: acc.account_id },
                data: { page_id: match.name, updated_at: new Date() },
              });
              this.logger.log(`[Bootstrap] Backfilled page_id="${match.name}" for appId=${acc.gupshup_app_id}`);
            }
          }
        } catch (err: any) {
          this.logger.warn(`[Bootstrap] App name backfill failed: ${err?.message}`);
        }
      }

      const stuckAccounts = await this.prisma.social_accounts.findMany({
        where: {
          platform: "whatsapp",
          gupshup_app_status: { in: ["stuck", "error", "pending"] },
          gupshup_app_id: { not: null },
        },
        include: { businesses: { select: { business_name: true } } },
      });

      if (stuckAccounts.length === 0) {
        this.logger.log("[Bootstrap] No stuck WhatsApp accounts found.");
        return;
      }

      this.logger.log(`[Bootstrap] Found ${stuckAccounts.length} stuck/pending WhatsApp account(s). Retrying...`);

      for (const account of stuckAccounts) {
        const businessName = (account as any).businesses?.business_name ?? account.business_id;
        this.logger.log(`[Bootstrap] Retrying businessId=${account.business_id} appId=${account.gupshup_app_id} status=${account.gupshup_app_status}`);

        try {
          const result = await this.retryOnboarding({
            businessId: account.business_id,
            appName: businessName,
            wabaId: account.instagram_business_account_id ?? "",
            phone: account.username ?? "",
          });
          this.logger.log(`[Bootstrap] Retry result for businessId=${account.business_id}: action=${result.action} appId=${result.gupshupAppId}`);
        } catch (err) {
          this.logger.error(`[Bootstrap] Retry failed for businessId=${account.business_id}: ${err.message}`);
        }
      }
    } catch (err) {
      this.logger.error(`[Bootstrap] Failed to query stuck accounts: ${err.message}`);
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
    const webhookUrl = `${backendUrl}/whatsapp/webhook`;

    const params = new URLSearchParams();
    params.append("modes", "2047"); // 2047 = all events in v3
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
      const msg: string = error?.response?.data?.message ?? error.message ?? "";

      // Case 1 — message contains UUID: "App {uuid} already exists with phone {phone}"
      const match = msg.match(/App ([a-f0-9\-]{36}) already exists/i);
      if (match?.[1]) {
        this.logger.log(`[Step 1] App already exists (UUID in error), using existing appId=${match[1]}`);
        return { appId: match[1] };
      }

      // Case 2 — "Bot Already Exists" or similar without UUID: look up app by phone
      if (/bot already exists|app already exists|already exists/i.test(msg)) {
        this.logger.log(`[Step 1] App already exists (no UUID in error), looking up app by phone=${phone}`);
        const existingAppId = await this.findAppIdByPhone(phone, partnerToken);
        if (existingAppId) {
          this.logger.log(`[Step 1] Found existing appId=${existingAppId} via app list`);
          return { appId: existingAppId };
        }
      }

      // Case 3 — Rate limited (429): log and surface clearly
      const status = error?.response?.status;
      if (status === 429) {
        this.logger.error(`[Step 1] Rate limited by Gupshup (429). Try again in 60s.`);
        throw new InternalServerErrorException(`Gupshup rate limit hit. Please retry in a minute.`);
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

  /** Fetch app details (includes live status) via GET /partner/app/:appId */
  private async getAppDetails(appId: string, partnerAppToken: string): Promise<{ live: boolean } | null> {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/partner/app/${appId}`,
        { headers: { Authorization: partnerAppToken } },
      );
      return data?.app ?? data?.appDetails ?? null;
    } catch {
      return null;
    }
  }

  /** List all Gupshup partner apps (useful for finding appIds). */
  async listApps(): Promise<any[]> {
    const partnerToken = await this.getPartnerToken();
    const { data } = await axios.get(`${this.baseUrl}/partner/app/list`, { headers: { Authorization: partnerToken } });
    return data?.partnerAppList ?? data?.data ?? data?.apps ?? (Array.isArray(data) ? data : []);
  }

  /** Lookup an existing Gupshup app by phone number via GET /partner/app/list */
  private async findAppIdByPhone(phone: string, partnerToken: string): Promise<string | null> {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/partner/app/list`,
        { headers: { Authorization: partnerToken } },
      );
      this.logger.log(`[Step 1] findAppIdByPhone raw response: ${JSON.stringify(data).substring(0, 500)}`);
      const apps: any[] = data?.partnerAppList ?? data?.data ?? data?.apps ?? (Array.isArray(data) ? data : []);
      // Normalize phone for comparison: strip leading +
      const normalizedPhone = phone.replace(/^\+/, '');
      const match = apps.find((app) => {
        const appPhone: string = String(app.phone ?? app.phoneNumber ?? '').replace(/^\+/, '');
        return appPhone === normalizedPhone || appPhone.endsWith(normalizedPhone) || normalizedPhone.endsWith(appPhone);
      });
      if (!match) {
        this.logger.warn(`[Step 1] No app found for phone=${phone} among ${apps.length} apps`);
      }
      return match?.id ?? match?.appId ?? null;
    } catch (err) {
      this.logger.error(`[Step 1] findAppIdByPhone failed: ${err?.response?.data?.message ?? err.message}`);
      return null;
    }
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
    const webhookUrl = `${backendUrl}/whatsapp/webhook`;

    const params = new URLSearchParams();
    params.append("modes", "2047"); // 2047 = all events in v3
    params.append("tag", "BizNavigate-V3");
    params.append("url", webhookUrl);
    params.append("version", "3");
    params.append("showOnUI", "false");

    this.logger.log(`[Step 4] Subscribing webhook for appId=${appId} → ${webhookUrl}`);

    let data: any;
    try {
      ({ data } = await axios.post(
        `${this.baseUrl}/partner/app/${appId}/subscription`,
        params,
        { headers: { Authorization: partnerAppToken, "Content-Type": "application/x-www-form-urlencoded" } },
      ));
    } catch (err: any) {
      const errData = err?.response?.data;
      const errMsg: string = errData?.message ?? errData?.error ?? JSON.stringify(errData) ?? err.message;
      this.logger.warn(`[Step 4] Subscription call failed for appId=${appId}: ${errMsg}`);
      // Already subscribed — treat as success
      if (/already (subscribed|exists)/i.test(errMsg)) {
        this.logger.log(`[Step 4] Webhook already subscribed for appId=${appId}, skipping`);
        return null;
      }
      throw err;
    }

    if (data.status !== "success") {
      this.logger.warn(`[Step 4] Subscription non-success for appId=${appId}: ${JSON.stringify(data)}`);
    } else {
      this.logger.log(`[Step 4] Webhook subscribed for appId=${appId}`);
    }
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

    let stuckCount = 0;
    let lastStage: string | undefined;
    let lastPipeline: string | undefined;

    for (let attempt = 1; attempt <= this.POLL_MAX_ATTEMPTS; attempt++) {
      try {
        const result = await this.getPipelineStatus(appId, partnerAppToken);
        const stage = result.whatsapp?.creationStage;
        const pipeline = result.whatsapp?.pipeLineStage;

        this.logger.log(`[Polling ${attempt}/${this.POLL_MAX_ATTEMPTS}] appId=${appId} creationStage=${stage} pipelineStage=${pipeline}`);

        // Check live status from app details (more reliable than pipeline stage)
        const appDetails = await this.getAppDetails(appId, partnerAppToken);
        if (stage === "WHATSAPP_PROVISIONING_DONE" || appDetails?.live === true) {
          // ✅ App is live — subscribe webhook then mark account active
          try {
            await this.subscribeAppWebhook(appId, partnerAppToken);
          } catch (subErr) {
            this.logger.error(`[Polling] Webhook subscription failed for appId=${appId}: ${subErr.message}`);
          }

          await this.prisma.social_accounts.updateMany({
            where: { gupshup_app_id: appId, business_id: businessId },
            data: { gupshup_app_status: "live", is_active: true, updated_at: new Date() },
          });

          this.logger.log(`[Polling] ✅ App ${appId} is live! Account activated for business=${businessId}`);

          // Fetch Meta business verification status non-blocking
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

        // ── Stuck detection: INITIAL+NONE with no change across N consecutive polls ──
        if (stage === lastStage && pipeline === lastPipeline && stage === "INITIAL" && pipeline === "NONE") {
          stuckCount++;
          if (stuckCount >= this.STUCK_THRESHOLD) {
            await this.prisma.social_accounts.updateMany({
              where: { gupshup_app_id: appId, business_id: businessId },
              data: { gupshup_app_status: "stuck", updated_at: new Date() },
            });
            this.logger.warn(
              `[Polling] ⚠️ App ${appId} is stuck at INITIAL/NONE for ${stuckCount} consecutive polls. ` +
              `Stopping poll — use POST /gupshup/onboarding/retry to force a new app creation.`,
            );
            return;
          }
        } else {
          stuckCount = 0;
        }

        lastStage = stage;
        lastPipeline = pipeline;
      } catch (err) {
        this.logger.error(`[Polling] Error on attempt ${attempt} for appId=${appId}: ${err.message}`);
      }

      // Wait before next poll (skip wait on last attempt)
      if (attempt < this.POLL_MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, this.POLL_INTERVAL_MS));
      }
    }

    this.logger.warn(`[Polling] ⏰ Timed out waiting for appId=${appId} to go live after ${this.POLL_MAX_ATTEMPTS} attempts`);
    await this.prisma.social_accounts.updateMany({
      where: { gupshup_app_id: appId, business_id: businessId },
      data: { gupshup_app_status: "stuck", updated_at: new Date() },
    });
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
    // Must be globally unique across ALL Gupshup partners — use wabaId (globally unique) as the primary key
    let safeName = appName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (safeName.length < 4) safeName = safeName.padEnd(4, 'biz');
    const wabaClean = wabaId.replace(/[^a-zA-Z0-9]/g, '');
    // wabaId alone guarantees global uniqueness; prefix with business name for readability
    const finalAppName = `${safeName.substring(0, 20)}${wabaClean}`.substring(0, 150);

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
        page_id: finalAppName, // store app name for webhook routing (body.app)
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
  async handleLiveEvent(payload: { appId?: string; phone?: string; waId?: string; status?: string }): Promise<void> {
    const { appId, phone, waId, status } = payload;
    const phoneToMatch = waId || phone;

    this.logger.log(`[LiveEvent] Received live event: appId=${appId} phone=${phoneToMatch} status=${status}`);

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

    const resolvedAppId = appId || account.gupshup_app_id;
    if (!resolvedAppId) {
      this.logger.warn(`[LiveEvent] No gupshup_app_id found for account ${account.account_id}`);
      return;
    }

    // ── Option 6: Verify pipeline status before trusting the event ────────────
    let pipelineConfirmed = false;
    try {
      const partnerAppToken = await this.getPartnerAppToken(resolvedAppId);
      const pipelineStatus = await this.getPipelineStatus(resolvedAppId, partnerAppToken);
      const stage = pipelineStatus.whatsapp?.creationStage;

      this.logger.log(`[LiveEvent] Pipeline check for appId=${resolvedAppId}: creationStage=${stage}`);

      if (stage === "WHATSAPP_PROVISIONING_DONE") {
        pipelineConfirmed = true;
        try {
          await this.subscribeAppWebhook(resolvedAppId, partnerAppToken);
        } catch (subErr) {
          this.logger.error(`[LiveEvent] Webhook re-subscription failed: ${subErr.message}`);
          // Non-fatal
        }
      } else if (stage === "INITIAL" || stage === "NONE") {
        // Live event fired but pipeline hasn't progressed — resume polling
        this.logger.warn(`[LiveEvent] Live event received but pipeline still at ${stage}. Resuming poll.`);
        this.pollUntilLive(resolvedAppId, partnerAppToken, account.business_id).catch((err) =>
          this.logger.error(`[LiveEvent] Resumed poll failed for appId=${resolvedAppId}: ${err.message}`),
        );
        await this.prisma.social_accounts.updateMany({
          where: { gupshup_app_id: resolvedAppId },
          data: { gupshup_app_status: "pending", updated_at: new Date() },
        });
        return;
      }
    } catch (err) {
      this.logger.error(`[LiveEvent] Pipeline verification failed: ${err.message}. Trusting event payload.`);
      // Fall back to trusting the event if pipeline check itself fails
      pipelineConfirmed = status === "live";
    }

    if (!pipelineConfirmed) {
      this.logger.warn(`[LiveEvent] Pipeline not confirmed live for appId=${resolvedAppId}, skipping activation`);
      return;
    }

    if (account.gupshup_app_status === "live") {
      this.logger.log(`[LiveEvent] Account ${account.account_id} already live, skipping`);
      return;
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
  // RETRY — Force a fresh app creation when stuck/error
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Option 2 — Update the callback URL on an existing Gupshup app via PUT /partner/app/{appId}.
   * This can sometimes kick a stuck pipeline back into motion on Gupshup's side.
   */
  async updateCallbackUrl(appId: string, callbackUrl: string): Promise<{ isLive: boolean }> {
    const partnerToken = await this.getPartnerToken();

    const params = new URLSearchParams();
    params.append("callbackUrl", callbackUrl);

    this.logger.log(`[Retry] Updating callbackUrl for appId=${appId} to kick pipeline`);

    try {
      const { data } = await axios.put(
        `${this.baseUrl}/partner/app/${appId}`,
        params,
        { headers: { Authorization: partnerToken, "Content-Type": "application/x-www-form-urlencoded" } },
      );
      this.logger.log(`[Retry] callbackUrl update result for appId=${appId}: ${JSON.stringify(data)}`);
      // The PUT response includes appDetails with live status — use this as source of truth
      const isLive = data?.appDetails?.live === true;
      return { isLive };
    } catch (err) {
      this.logger.error(`[Retry] callbackUrl update failed for appId=${appId}: ${err?.response?.data?.message ?? err.message}`);
      throw err;
    }
  }

  /**
   * Option 4 — Force retry for a stuck/error business.
   *
   * Strategy (since Gupshup has no delete/reset API):
   *   1. Try updating the callbackUrl (Option 2) to nudge the existing pipeline.
   *   2. Re-poll the pipeline — if it progresses, great.
   *   3. If still stuck, create a brand-new Gupshup app with a unique name suffix
   *      (Gupshup allows multiple apps per WABA; we link the newest one).
   *   4. Start a fresh poll for the new appId.
   */
  async retryOnboarding(opts: TppOnboardingOptions): Promise<{ gupshupAppId: string; action: string }> {
    const { businessId, appName, wabaId, phone, callbackUrl } = opts;

    // Find the current stuck/error account
    const account = await this.prisma.social_accounts.findFirst({
      where: { business_id: businessId, platform: "whatsapp" },
    });

    const backendUrl = this.config.get<string>("BACKEND_URL");
    const resolvedCallbackUrl = callbackUrl ?? `${backendUrl}/whatsapp/gupshup/live-event`;

    // ── Option 2: Try nudging existing app first ──────────────────────────────
    if (account?.gupshup_app_id) {
      try {
        const { isLive } = await this.updateCallbackUrl(account.gupshup_app_id, resolvedCallbackUrl);

        // PUT /partner/app returns appDetails.live — use this as source of truth
        // The pipeline API (creationStage) can lag behind the actual live status
        if (isLive) {
          const partnerAppToken = await this.getPartnerAppToken(account.gupshup_app_id);
          try { await this.subscribeAppWebhook(account.gupshup_app_id, partnerAppToken); } catch (_) { /* non-fatal */ }
          await this.prisma.social_accounts.updateMany({
            where: { gupshup_app_id: account.gupshup_app_id, business_id: businessId },
            data: { gupshup_app_status: "live", is_active: true, updated_at: new Date() },
          });
          this.logger.log(`[Retry] ✅ App ${account.gupshup_app_id} is live (confirmed via appDetails) — activated`);
          return { gupshupAppId: account.gupshup_app_id, action: "activated_existing" };
        }

        const partnerAppToken = await this.getPartnerAppToken(account.gupshup_app_id);
        const status = await this.getPipelineStatus(account.gupshup_app_id, partnerAppToken);
        const stage = status.whatsapp?.creationStage;

        this.logger.log(`[Retry] Post-nudge pipeline stage for appId=${account.gupshup_app_id}: ${stage}`);

        if (stage === "WHATSAPP_PROVISIONING_DONE") {
          try { await this.subscribeAppWebhook(account.gupshup_app_id, partnerAppToken); } catch (_) { /* non-fatal */ }
          await this.prisma.social_accounts.updateMany({
            where: { gupshup_app_id: account.gupshup_app_id, business_id: businessId },
            data: { gupshup_app_status: "live", is_active: true, updated_at: new Date() },
          });
          this.logger.log(`[Retry] ✅ Existing app was already provisioned — activated appId=${account.gupshup_app_id}`);
          return { gupshupAppId: account.gupshup_app_id, action: "activated_existing" };
        }

        if (stage !== "INITIAL" && stage !== "ERROR") {
          // Pipeline is progressing — re-start polling
          this.pollUntilLive(account.gupshup_app_id, partnerAppToken, businessId).catch((err) =>
            this.logger.error(`[Retry] Background poll failed for appId=${account.gupshup_app_id}: ${err.message}`),
          );
          await this.prisma.social_accounts.updateMany({
            where: { gupshup_app_id: account.gupshup_app_id, business_id: businessId },
            data: { gupshup_app_status: "pending", updated_at: new Date() },
          });
          return { gupshupAppId: account.gupshup_app_id, action: "resumed_existing" };
        }
      } catch (_) {
        // Nudge failed — fall through to Option 4 (new app)
      }
    }

    // ── Option 4: Create a brand-new app with a unique name suffix ────────────
    // Gupshup only allows one app per phone. If the phone is already registered,
    // extract the existing appId from the 409 error and re-poll it instead.
    let safeName = appName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (safeName.length < 6) safeName = safeName.padEnd(6, 'abc123');
    const suffix = Date.now().toString(36); // short base-36 timestamp
    const finalAppName = `${safeName}${suffix}`.substring(0, 150);
    const finalPhone = phone.replace(/[\s\-\(\)]/g, '');

    this.logger.log(`[Retry] Creating new Gupshup app: name=${finalAppName} wabaId=${wabaId} phone=${finalPhone}`);

    let resolvedAppId: string;

    try {
      const { data } = await axios.post(
        `${this.baseUrl}/partner/tpp/app`,
        new URLSearchParams({ name: finalAppName, wabaId, phone: finalPhone, ...(resolvedCallbackUrl ? { callbackUrl: resolvedCallbackUrl } : {}) }),
        { headers: { Authorization: await this.getPartnerToken(), "Content-Type": "application/x-www-form-urlencoded" } },
      );

      if (data.status !== "success" || !data.appId) {
        throw new InternalServerErrorException(`[Retry] New app creation failed: ${data.message ?? "Unknown error"}`);
      }

      resolvedAppId = data.appId;
      this.logger.log(`[Retry] New app created: appId=${resolvedAppId}`);
    } catch (err) {
      const errMsg: string = err?.response?.data?.message ?? err.message ?? "";

      // 409 — phone already linked to an existing Gupshup app; extract that appId
      const match = errMsg.match(/App ([a-f0-9\-]{36}) already exists/i);
      if (match?.[1]) {
        resolvedAppId = match[1];
        this.logger.log(`[Retry] Phone already registered — reusing existing appId=${resolvedAppId}`);
      } else {
        throw new InternalServerErrorException(`[Retry] New app creation failed: ${errMsg}`);
      }
    }

    // Persist appId and reset status
    await this.prisma.social_accounts.updateMany({
      where: { business_id: businessId, platform: "whatsapp" },
      data: { gupshup_app_id: resolvedAppId, gupshup_app_status: "pending", is_active: false, updated_at: new Date() },
    });

    const partnerAppToken = await this.getPartnerAppToken(resolvedAppId);

    // Check pipeline once before committing to a full poll
    const immediateStatus = await this.getPipelineStatus(resolvedAppId, partnerAppToken);
    const immediateStage = immediateStatus.whatsapp?.creationStage;
    this.logger.log(`[Retry] Pipeline stage for appId=${resolvedAppId}: ${immediateStage}`);

    if (immediateStage === "WHATSAPP_PROVISIONING_DONE") {
      try { await this.subscribeAppWebhook(resolvedAppId, partnerAppToken); } catch (_) { /* non-fatal */ }
      await this.prisma.social_accounts.updateMany({
        where: { business_id: businessId, platform: "whatsapp" },
        data: { gupshup_app_status: "live", is_active: true, updated_at: new Date() },
      });
      this.logger.log(`[Retry] ✅ App ${resolvedAppId} already provisioned — activated immediately`);
      return { gupshupAppId: resolvedAppId, action: "activated_existing" };
    }

    if (immediateStage === "INITIAL") {
      // Pipeline never started on Gupshup's side — polling won't help.
      // Mark as stuck so bootstrap doesn't retry endlessly. Requires Gupshup support to reset.
      await this.prisma.social_accounts.updateMany({
        where: { business_id: businessId, platform: "whatsapp" },
        data: { gupshup_app_status: "stuck", updated_at: new Date() },
      });
      this.logger.warn(
        `[Retry] ⚠️ App ${resolvedAppId} is stuck at INITIAL on Gupshup's side. ` +
        `Contact Gupshup support to reset pipeline for wabaId=${wabaId} phone=${finalPhone}.`,
      );
      return { gupshupAppId: resolvedAppId, action: "stuck" };
    }

    this.pollUntilLive(resolvedAppId, partnerAppToken, businessId).catch((err) =>
      this.logger.error(`[Retry] Background poll failed for appId=${resolvedAppId}: ${err.message}`),
    );

    return { gupshupAppId: resolvedAppId, action: "polling" };
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

  /**
   * Fetch Meta WABA account_review_status and store it in social_accounts.
   * Non-fatal — called via setImmediate after account goes live.
   */
  private async fetchMetaVerificationStatus(accountId: string, wabaId: string): Promise<void> {
    try {
      const apiVersion = this.config.get<string>('WHATSAPP_API_VERSION', 'v24.0');
      const token = this.config.get<string>('WHATSAPP_PERMANENT_TOKEN', '');
      const { data } = await axios.get(
        `https://graph.facebook.com/${apiVersion}/${wabaId}`,
        {
          params: { fields: 'id,name,account_review_status,business_verification_status' },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await this.prisma.social_accounts.update({
        where: { account_id: accountId },
        data: {
          meta_account_review_status: data.account_review_status ?? null,
          meta_verification_checked_at: new Date(),
        },
      });
      this.logger.log(`[Verification] account ${accountId} → ${data.account_review_status}`);
    } catch (err) {
      this.logger.warn(`[Verification] Could not fetch status for account ${accountId}: ${err.message}`);
    }
  }


  
}
