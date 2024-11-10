import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
  Get,
  Param,
  Query,
  Put,
} from "@nestjs/common";
import { StartupService } from "src/service/businessprofileservice/startup.service";
import { Startup } from "src/entities/businessprofileentities/startup.entity";
import * as jwt from "jsonwebtoken"; // Import jsonwebtoken
import { UserService } from "src/service/user.service";
import { FundingRound } from "src/entities/financialentities/funding.entity";

@Controller("startups")
export class StartupsController {
  constructor(
    private readonly startupService: StartupService,
    private readonly userService: UserService // inject UserService
  ) {}

  private getUserIdFromToken(authorizationHeader?: string): number {
    if (!authorizationHeader) {
      throw new UnauthorizedException("Authorization header is required");
    }
    const token = authorizationHeader.replace("Bearer ", "");

    const payload = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    return payload.userId;
  }

  @Post("create")
  async create(
    @Req() request: Request,
    @Body() startupData: Startup
  ): Promise<any> {
    const userId = this.getUserIdFromToken(request.headers["authorization"]);
    await this.startupService.create(userId, startupData);
    return { message: "Startup created successfully" };
  }

   // New endpoint to approve a startup
   @Put(":id/approve")
   async approveStartup(@Param("id") id: string): Promise<any> {
     await this.startupService.approveStartup(Number(id));
     return { message: `Startup with ID ${id} has been approved` };
   }
 
   // New endpoint to reject a startup
   @Put(":id/reject")
   async rejectStartup(@Param("id") id: string): Promise<any> {
     await this.startupService.rejectStartup(Number(id));
     return { message: `Startup with ID ${id} has been rejected` };
   }

   @Put(":id/cancel")
   async cancelStartup(@Param("id") id: string): Promise<any> {
     await this.startupService.cancelStartup(Number(id));
     return { message: `Startup with ID ${id} has been cancelled` };
   }

  @Get()
  findAll(@Req() request: Request) {
    const userId = this.getUserIdFromToken(request.headers["authorization"]);
    return this.startupService.findAll(userId);
  }

  @Get('guest')
  async findAllStartupsforguest(): Promise<Startup[]> {
    return this.startupService.findAllStarupsforguest();
  }

  @Get("all")
  async findAllStartups(): Promise<Startup[]> {
    try {
      const startups =
        await this.startupService.findAllStartupsWithFundingRounds();
      if (!startups || startups.length === 0) {
      }
      return startups;
    } catch (error) {}
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Startup> {
    return this.startupService.findOne(Number(id));
  }

  @Get(":id/funding-rounds")
  async findOneWithFundingRounds(@Param("id") id: string): Promise<Startup> {
    return this.startupService.findOneWithFundingRounds(Number(id));
  }

  @Put(":id")
  async update(
    @Param("id") id: number,
    @Body() startupData: Startup
  ): Promise<Startup> {
    return this.startupService.update(Number(id), startupData);
  }

  @Put(":id/delete")
  async softDelete(@Param("id") id: number): Promise<void> {
    return this.startupService.softDelete(Number(id));
  }
}
