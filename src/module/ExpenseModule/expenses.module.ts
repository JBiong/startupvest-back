import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesController } from 'src/controller/ExpenseController/expenses.controller';
import { ExpensesService } from 'src/service/ExpenseService/expenses.service';
import { Expenses } from 'src/entities/ExpenseEntity/expenses.entity';
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expenses, User, Startup]), // Register entities used in the service
  ],
  controllers: [ExpensesController], // Register the controller
  providers: [ExpensesService], // Register the service
  exports: [ExpensesService], // Export the service if needed in other modules
})
export class ExpensesModule {}
