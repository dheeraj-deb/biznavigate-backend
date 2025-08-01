import { Injectable, LoggerService } from "@nestjs/common";

@Injectable()
export class ConversationLoggerService implements LoggerService {
  log(message: string, context?: string) {
    // Persist to DB, file, or log aggregator if required
    console.log(`[LOG]${context ? " [" + context + "]" : ""} ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(
      `[ERROR]${context ? " [" + context + "]" : ""} ${message}`,
      trace
    );
  }

  warn(message: string, context?: string) {
    console.warn(`[WARN]${context ? " [" + context + "]" : ""} ${message}`);
  }

  async logStateTransition(
    sessionId: string,
    fromState: string,
    toState: string
  ) {
    // Record state change in storage if desired
    this.log(
      `Session ${sessionId} transitioned from ${fromState} to ${toState}`,
      "StateTransition"
    );
    // Optionally persist in DB for auditing
  }

  async logUserMessage(sessionId: string, message: string, timestamp: Date) {
    this.log(
      `Session ${sessionId}: User sent "${message}" at ${timestamp.toISOString()}`,
      "UserMessage"
    );
    // Optionally persist message log
  }
}
