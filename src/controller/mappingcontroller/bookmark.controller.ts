import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { Bookmark } from "src/entities/mappingentities/bookmark.entity";
import { BookmarkService } from "src/service/mappingservice/bookmark.service";

@Controller("/bookmarks")
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @HttpCode(HttpStatus.OK)
  @Get("/")
  getAll() {
    return this.bookmarkService.findAll();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post("/")
  create(@Body() bookmark: Partial<Bookmark>) {
    return this.bookmarkService.create(bookmark);
  }

  @HttpCode(HttpStatus.OK)
  @Get("/:userId")
  findAllByUserId(@Param("userId") userId: number) {
    return this.bookmarkService.findAllByUserId(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Delete("/:userId/startup/:startupId")
  startupRemove(@Param("userId") userId: number, @Param("startupId") startupId: number) {
    return this.bookmarkService.startupRemove(userId, startupId);
  }

  @HttpCode(HttpStatus.OK)
  @Delete("/:userId/investor/:investorId")
  investorRemove(@Param("userId") userId: number, @Param("investorId") investorId: number) {
    return this.bookmarkService.investorRemove(userId, investorId);
  }

  @HttpCode(HttpStatus.OK)
  @Get("/startup/:startupId")
  findallByStartupId(@Param("startupId") startupId: number) {
    return this.bookmarkService.findAllByInvestorId(startupId);
  }

  @HttpCode(HttpStatus.OK)
  @Get("/investor/:investorId")
  findAllByInvestorId(@Param("investorId") investorId: number) {
    return this.bookmarkService.findAllByInvestorId(investorId);
  }

  @HttpCode(HttpStatus.OK)
  @Get("/:userId/startup/:startupId")
  findOneByUserIdandStartupId(
    @Param("userId") userId: number,
    @Param("startupId") startupId: number
  ) {
    return this.bookmarkService.findOneByUserIdandStartupId(userId, startupId);
  }

  @HttpCode(HttpStatus.OK)
  @Get("/:userId/investor/:investorId")
  findOneByUserIdandInvestorId(
    @Param("userId") userId: number,
    @Param("investorId") investorId: number
  ) {
    return this.bookmarkService.findOneByUserIdandInvestorId(userId, investorId);
  }
}
