import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ViewService } from "src/service/mappingservice/view.service";
import { View } from "src/entities/mappingentities/view.entity";
@Controller("/views")
export class ViewController {
	constructor(private readonly viewService: ViewService) {}

	@HttpCode(HttpStatus.CREATED)
	@Post("/")
	create(@Body() view: Partial<View>) {
		return this.viewService.create(view);
	}

	@HttpCode(HttpStatus.OK)
	@Get("/:userId")
	findRecentsByUserId(@Param("userId") userId: number) {
		return this.viewService.findRecentsByUserId(userId);
	}

	@HttpCode(HttpStatus.OK)
	@Get("/startup/:startupId")
	findAllByStartupId(@Param("startupId") startupId: number) {
		return this.viewService.findAllByStartupId(startupId);
	}

	@HttpCode(HttpStatus.OK)
	@Get("/investor/:investorId")
	findAllByInvestorId(@Param("investorId") investorId: number) {
		return this.viewService.findAllByInvestorId(investorId);
	}

	@HttpCode(HttpStatus.OK)
	@Get("/")
	getAll() {
		return this.viewService.findAll();
	}
}
