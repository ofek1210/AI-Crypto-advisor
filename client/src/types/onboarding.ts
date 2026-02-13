export type OnboardingAnswers = {
  assetInterests: 'btc' | 'eth' | 'alts' | 'stable' | 'nft';
  investorType: 'hodler' | 'day_trader' | 'nft_collector' | 'defi' | 'other';
  contentType: 'market_news' | 'charts' | 'social' | 'fun' | 'all';
};

export type OnboardingQuestion = {
  id: keyof OnboardingAnswers;
  title: string;
  options: { value: OnboardingAnswers[keyof OnboardingAnswers]; label: string }[];
};
