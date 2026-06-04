export enum CampaignStatus {
    DRAFT = 'DRAFT',
    SCHEDULED = 'SCHEDULED',
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

export enum CampaignType {
    ONE_TIME = 'ONE_TIME',
    RECURRING = 'RECURRING',
}

export enum AudienceFilterOperator {
    AND = 'AND',
    OR = 'OR',
}