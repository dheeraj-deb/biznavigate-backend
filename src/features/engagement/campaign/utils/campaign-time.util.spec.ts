import { resolveCampaignSendAt } from './campaign-time.util';

describe('campaign time utilities', () => {
    it('interprets timezone-less campaign times in the campaign timezone', () => {
        const { sendAt, timezone } = resolveCampaignSendAt(
            '2026-05-10T10:00:00',
            'Asia/Kolkata',
        );

        expect(timezone).toBe('Asia/Kolkata');
        expect(sendAt.toISOString()).toBe('2026-05-10T04:30:00.000Z');
    });

    it('keeps explicit UTC instants unchanged', () => {
        const { sendAt } = resolveCampaignSendAt(
            '2026-05-10T10:00:00.000Z',
            'Asia/Kolkata',
        );

        expect(sendAt.toISOString()).toBe('2026-05-10T10:00:00.000Z');
    });

    it('keeps explicit offset instants unchanged', () => {
        const { sendAt } = resolveCampaignSendAt(
            '2026-05-10T10:00:00+05:30',
            'UTC',
        );

        expect(sendAt.toISOString()).toBe('2026-05-10T04:30:00.000Z');
    });
});
