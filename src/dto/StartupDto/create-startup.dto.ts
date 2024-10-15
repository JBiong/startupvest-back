import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

export class CreateStartupDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  startupName: string;

  @IsNotEmpty()
  @IsString()
  startupDescription: string;

  @IsNotEmpty()
  @IsString()
  startupType: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 11)
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  contactEmail: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  startupCode: string;
}
