import { CanActivate, ExecutionContext, Injectable, RawBodyRequest, UnauthorizedException } from "@nestjs/common";
import { WebhookValidatorService } from "../infrastructure/webhook-validator.service";
import { Observable } from "rxjs";

@Injectable()
export class WhatsAppSignatureGuard implements CanActivate {
    constructor(private readonly webhookValidator: WebhookValidatorService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context
            .switchToHttp()
            .getRequest<RawBodyRequest<Request>>();

        // Gupshup V3 webhooks carry gs_app_id and no X-Hub-Signature-256.
        // They are identified by the presence of gs_app_id in the body.
        const body = req.body as any;
        if (body?.gs_app_id) {
            // Gupshup webhook — no signature to verify, allow through
            return true;
        }

        // Meta Cloud API webhook — verify X-Hub-Signature-256
        const signature = req.headers['x-hub-signature-256'] as string;
        const rawBody = req.rawBody
            ? req.rawBody.toString('utf8')
            : JSON.stringify(req.body);

        if (!this.webhookValidator.verifySignature(rawBody, signature)) {
            throw new UnauthorizedException('Invalid webhook signature');
        }

        return true;
    }

}