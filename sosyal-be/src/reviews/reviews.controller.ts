import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("reviews")
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    console.log("createReviewDto", req.user);
    return this.reviewsService.createReview(req.user.id, createReviewDto);
  }

  @Get("business/:businessId")
  async getBusinessReviews(
    @Param("businessId") businessId: string,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 10
  ) {
    return this.reviewsService.getBusinessReviews(businessId, page, limit);
  }

  @Get("user/:businessId")
  async getUserReview(@Request() req, @Param("businessId") businessId: string) {
    return this.reviewsService.getUserReview(req.user.id, businessId);
  }

  @Put(":reviewId")
  async updateReview(
    @Request() req,
    @Param("reviewId") reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    return this.reviewsService.updateReview(
      reviewId,
      req.user.id,
      updateReviewDto
    );
  }

  @Delete(":reviewId")
  async deleteReview(@Request() req, @Param("reviewId") reviewId: string) {
    return this.reviewsService.deleteReview(reviewId, req.user.userId);
  }
}
