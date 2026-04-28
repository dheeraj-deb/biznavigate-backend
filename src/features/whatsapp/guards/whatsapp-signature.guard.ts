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