import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  @Length(1,20)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1,20)
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1,30)
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1,50)
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(1,11)
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @Length(1,30)
  country: string;

  @IsNotEmpty()
  @IsString()
  @Length(1,30)
  city: string;

  @IsNotEmpty()
  @IsString()
  @Length(1,30)
  state: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  zipCode: number;
}
