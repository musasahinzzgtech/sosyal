import { IsNotEmpty, IsNumber, IsString, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  businessId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Yorum en az 10 karakter olmalıdır' })
  @MaxLength(500, { message: 'Yorum en fazla 500 karakter olabilir' })
  comment: string;
}
