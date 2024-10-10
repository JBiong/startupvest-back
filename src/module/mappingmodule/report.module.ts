import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReportController } from "src/controller/mappingcontroller/report.controller";
import { Report } from "src/entities/mappingentities/report.entity";
import { ReportService } from "src/service/mappingservice/report.service";

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
