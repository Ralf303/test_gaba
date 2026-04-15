import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreatePromoCodeDto {
  @IsString()
  @Length(3, 64)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  code!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent!: number;

  @IsInt()
  @Min(1)
  activationLimit!: number;

  @IsDateString()
  expiresAt!: string;
}
