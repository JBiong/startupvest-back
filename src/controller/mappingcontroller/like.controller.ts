import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { Like } from "src/entities/mappingentities/like.entity";
import { LikeService } from "src/service/mappingservice/like.service";

@Controller("/likes")
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @HttpCode(HttpStatus.OK)
  @Get("/")
  getAll() {
    return this.likeService.findAll();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post("/")
  create(@Body() like: Partial<Like>) {
    return this.likeService.create(like);
  }

  @HttpCode(HttpStatus.OK)
  @Delete("/:userId/startup/:startupId")
  startupRemove(@Param("userId") userId: number, @Param("startupId") startupId: number) {
    return this.likeService.startupRemove(userId, startupId);
  }

  @HttpCode(HttpStatus.OK)
  @Delete("/:userId/investor/:investorId")
  investorRemove(@Param("userId") userId: number, @Param("investorId") investorId: number) {
    return this.likeService.investorRemove(userId, investorId);
  }

  @HttpCode(HttpStatus.OK)
  @Get("/:startupId")
  findallByStartupId(@Param("startupId") startupId: number) {
    return this.likeService.findAllByInvestorId(startupId);
  }

  @HttpCode(HttpStatus.OK)
  @Get("/:investorId")
  findAllByInvestorId(@Param("investorId") investorId: number) {
    return this.likeService.findAllByInvestorId(investorId);
  }

  @HttpCode(HttpStatus.OK)
  @Get("/:userId/startup/:startupId")
  findOneByUserIdandStartupId(
    @Param("userId") userId: number,
    @Param("startupId") startupId: number
  ) {
    return this.likeService.findOneByUserIdandStartupId(userId, startupId);
  }

  @HttpCode(HttpStatus.OK)
  @Get("/:userId/investor/:investorId")
  findOneByUserIdandInvestorId(
    @Param("userId") userId: number,
    @Param("investorId") investorId: number
  ) {
    return this.likeService.findOneByUserIdandInvestorId(userId, investorId);
  }
}
