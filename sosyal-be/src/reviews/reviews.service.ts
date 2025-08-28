import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Review, ReviewDocument } from "./schemas/review.schema";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { User } from "../users/schemas/user.schema";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async createReview(
    reviewerId: string,
    createReviewDto: CreateReviewDto
  ): Promise<Review> {
    const { businessId, rating, comment } = createReviewDto;

    // Check if business exists and is a business user
    const business = await this.userModel.findById(businessId);
    if (!business || business.userType !== "isletme") {
      throw new NotFoundException("İşletme bulunamadı");
    }

    // Check if user already reviewed this business
    const existingReview = await this.reviewModel.findOne({
      reviewerId: new Types.ObjectId(reviewerId),
      businessId: new Types.ObjectId(businessId),
    });

    if (existingReview) {
      throw new BadRequestException(
        "Bu işletmeye zaten değerlendirme yapmışsınız"
      );
    }

    // Create the review
    const review = new this.reviewModel({
      reviewerId: new Types.ObjectId(reviewerId),
      businessId: new Types.ObjectId(businessId),
      rating,
      comment,
    });

    const savedReview = await review.save();

    // Update business rating
    await this.updateBusinessRating(businessId);

    return savedReview;
  }

  async getBusinessReviews(
    businessId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const reviews = await this.reviewModel
      .find({ businessId: new Types.ObjectId(businessId), isActive: true })
      .populate("reviewerId", "firstName lastName photos")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.reviewModel.countDocuments({
      businessId: new Types.ObjectId(businessId),
      isActive: true,
    });
    console.log("reviews", reviews);
    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserReview(
    reviewerId: string,
    businessId: string
  ): Promise<Review | null> {
    return this.reviewModel
      .findOne({
        reviewerId: new Types.ObjectId(reviewerId),
        businessId: new Types.ObjectId(businessId),
        isActive: true,
      })
      .exec();
  }

  async updateReview(
    reviewId: string,
    reviewerId: string,
    updateReviewDto: UpdateReviewDto
  ): Promise<Review> {
    const review = await this.reviewModel.findOne({
      _id: new Types.ObjectId(reviewId),
      reviewerId: new Types.ObjectId(reviewerId),
      isActive: true,
    });

    if (!review) {
      throw new NotFoundException("Değerlendirme bulunamadı");
    }

    Object.assign(review, updateReviewDto);
    const updatedReview = await review.save();

    // Update business rating
    await this.updateBusinessRating(review.businessId.toString());

    return updatedReview;
  }

  async deleteReview(reviewId: string, reviewerId: string): Promise<void> {
    const review = await this.reviewModel.findOne({
      _id: new Types.ObjectId(reviewId),
      reviewerId: new Types.ObjectId(reviewerId),
      isActive: true,
    });

    if (!review) {
      throw new NotFoundException("Değerlendirme bulunamadı");
    }

    review.isActive = false;
    await review.save();

    // Update business rating
    await this.updateBusinessRating(review.businessId.toString());
  }

  private async updateBusinessRating(businessId: string): Promise<void> {
    const reviews = await this.reviewModel.find({
      businessId: new Types.ObjectId(businessId),
      isActive: true,
    });

    if (reviews.length === 0) {
      // No reviews, reset rating
      await this.userModel.findByIdAndUpdate(businessId, {
        rating: 0,
        reviewCount: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await this.userModel.findByIdAndUpdate(businessId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length,
    });
  }
}
