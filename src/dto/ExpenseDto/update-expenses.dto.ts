import { PartialType } from "@nestjs/mapped-types";
import { CreateExpensesDto } from "./create-expenses.dto";


export class UpdateExpensesDto extends PartialType(CreateExpensesDto){}