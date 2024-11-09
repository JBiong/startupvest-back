import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { ReportService } from "src/service/mappingservice/report.service";
import type { Report } from "src/entities/mappingentities/report.entity";

@Controller("/reports")
export class ReportController {
	constructor(private readonly reportService: ReportService) {}

	@HttpCode(HttpStatus.OK)
	@Get("/")
	getAll() {
		return this.reportService.findAll();
	}

	@HttpCode(HttpStatus.OK)
	@Get("/:reportId")
	getOneById(@Param("reportId") reportId: number) {
		return this.reportService.findOneById(reportId);
	}

	@HttpCode(HttpStatus.CREATED)
	@Post("/")
	create(@Body() report: Partial<Report>) {
		return this.reportService.create(report);
	}

	@HttpCode(HttpStatus.OK)
	@Put("/:reportId")
	update(@Param("reportId") reportId: number, @Body() report: Partial<Report>) {
		return this.reportService.update(reportId, report);
	}

	@HttpCode(HttpStatus.GONE)
	@Delete("/:reportId")
	delete(@Param("reportId") reportId: number) {
		return this.reportService.remove(reportId);
	}

	@HttpCode(HttpStatus.OK)
	@Get("/user/:userId") // Get reports by user ID
	getAllByUserId(@Param("userId") userId: number) {
		return this.reportService.findAllByUserId(userId);
	}
}
