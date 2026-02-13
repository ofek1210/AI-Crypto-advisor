import mongoose, { Schema, InferSchemaType } from 'mongoose';

const voteSchema = new Schema(
  {
    source: {
      type: String,
      required: true,
      enum: ['insight', 'news', 'meme', 'dashboard']
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
