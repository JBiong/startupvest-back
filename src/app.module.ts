import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "./entities/user.entity";
import { UsersModule } from "./module/user.module";
import { Startup } from "./entities/businessprofileentities/startup.entity";
import { Investor } from "./entities/businessprofileentities/investor.entity";
import { StartupModule } from "./module/businessprofilemodule/startup.module";
import { InvestorModule } from "./module/businessprofilemodule/investor.module";
import { FundingRound } from "./entities/financialentities/funding.entity";
import { FundingModule } from "./module/financialmodule/funding.module";
import { ProfilePictureModule } from "./module/profilepicturemodule/profilepicture.module";
import { ProfilePicture } from "./entities/profilepictureentities/profilepicture.entity";
import { CapTableInvestor } from "./entities/financialentities/capInvestor.entity";
import { ActivityModule } from "./module/activitymodule/activity.module";
import { Activity } from "./entities/activityentities/activity.entity";
import { Bookmark } from "./entities/mappingentities/bookmark.entity";
import { Like } from "./entities/mappingentities/like.entity";
import { Report } from "./entities/mappingentities/report.entity";
import { View } from "./entities/mappingentities/view.entity";
import { LikeModule } from "./module/mappingmodule/like.module";
import { BookmarkModule } from "./module/mappingmodule/bookmark.module";
import { ReportModule } from "./module/mappingmodule/report.module";
import { ViewModule } from "./module/mappingmodule/view.module";

import * as dotenv from "dotenv";
import { BudgetProposalModule } from "./module/BudgetProposalModule/budget-proposal.module";
import { CategoryModule } from "./module/CategoryModule/category.module";
import { CustomerModule } from "./module/CustomerModule/customer.module";
import { ExpensesModule } from "./module/ExpenseModule/expenses.module";
import { InvoiceModule } from "./module/InvoiceModule/invoice.module";
import { ItemModule } from "./module/ItemModule/item.module";
import { PaymentModule } from "./module/PaymentModule/payment.module";
import { ProjectModule } from "./module/ProjectModule/project.module";

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.MYSQL_HOST || "localhost",
      port: Number(process.env.MYSQL_PORT) || 3306,
      username: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "12345",
      database: process.env.MYSQL_DATABASE || "dbstartupvest",
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProfilePictureModule,
    UsersModule,
    StartupModule,
    InvestorModule,
    FundingModule,
    ActivityModule,
    BookmarkModule,
    LikeModule,
    ReportModule,
    ViewModule,
    ItemModule,
    CustomerModule,
    CategoryModule,
    ExpensesModule,
    InvoiceModule,
    PaymentModule,
    ProjectModule,
    BudgetProposalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
