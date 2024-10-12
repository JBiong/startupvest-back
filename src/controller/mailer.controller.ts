import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MailService } from 'src/service/mailer.service';
import { UserService } from 'src/service/user.service';

@Controller('mailer')
export class MailController {
    constructor(private readonly mailService:MailService, private readonly userService:UserService) {}

    @Get('verify-email')
    async verifyPostEmail(@Query('token') token: string): Promise<string> {
        const isVerified = await this.userService.verifyEmail(token);

        if (isVerified) {
        return 'Email verified successfully';
        } else {
        throw new BadRequestException('Email verification failed');
        }
    }
}