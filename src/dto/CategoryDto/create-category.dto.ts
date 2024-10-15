import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

export class CreateCategoryDto{
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsString()
    @Length(1,30)
    categoryName: string
}