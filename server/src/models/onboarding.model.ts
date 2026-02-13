import mongoose, { Schema, InferSchemaType } from 'mongoose';

const onboardingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    assetInterests: {
      type: String,
      enum: ['btc', 'eth', 'alts', 'stable', 'nft'],
      required: true
    },
    investorType: {
      type: String,
      enum: ['hodler', 'day_trader', 'nft_collector', 'defi', 'other'],
      required: true
    },
    contentType: {
      type: String,
      enum: ['market_news', 'charts', 'social', 'fun', 'all'],
      required: true
    }
  },
  { timestamps: true }
);

export type OnboardingDocument = InferSchemaType<typeof onboardingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const OnboardingModel = mongoose.model('Onboarding', onboardingSchema);
