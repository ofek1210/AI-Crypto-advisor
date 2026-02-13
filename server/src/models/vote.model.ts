import mongoose, { Schema, InferSchemaType } from 'mongoose';

const voteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    source: {
      type: String,
      required: true,
      enum: ['insight', 'news', 'meme', 'prices']
    },
    value: {
      type: String,
      required: true,
      enum: ['up', 'down']
    }
  },
  { timestamps: true }
);

export type VoteDocument = InferSchemaType<typeof voteSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const VoteModel = mongoose.model('Vote', voteSchema);
