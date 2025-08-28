import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review extends Document {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  reviewerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  businessId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, minlength: 10, maxlength: 500 })
  comment: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Compound index to ensure one review per user per business
ReviewSchema.index({ reviewerId: 1, businessId: 1 }, { unique: true });

// Index for business reviews
ReviewSchema.index({ businessId: 1, createdAt: -1 });

// Index for reviewer
ReviewSchema.index({ reviewerId: 1 });
