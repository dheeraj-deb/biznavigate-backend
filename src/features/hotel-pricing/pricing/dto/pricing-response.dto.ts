export interface PricingResponseDto {
  recommendationId: string;
  hotelId: string;
  orgId: string;
  roomType: string;
  checkinDate: string;
  suggestedPrice: number;
  demandScore: number;
  confidence: number;
  priceRange: { low: number; high: number };
  competitorAvgPrice: number;
  currentPrice: number;
  claudeNarrative: string;
  sevenDayForecast: number[];
  reasoningFeatures: {
    competitorPosition: string;
    dayFactor: string;
    seasonFactor: string;
    daysUntilCheckin: number;
    demandSignal: string;
  };
  cached: boolean;
}
