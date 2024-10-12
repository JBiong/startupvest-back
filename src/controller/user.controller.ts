import { Controller, Post, Body, Get, UnauthorizedException, Req, Put, Param, NotFoundException, Query, BadRequestException } from '@nestjs/common';
import { UserService } from 'src/service/user.service';
import { User } from 'src/entities/user.entity';
import { sign } from 'jsonwebtoken'; // Import jsonwebtoken
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { MailService } from 'src/service/mailer.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
  private usersRepository: Repository<User>,
  private readonly userService: UserService, 
  private readonly mailerService: MailService, 
  private readonly jwtService: JwtService,) { }

  @Post('register')
  async register(@Body() userData: any): Promise<void> {
    const { email } = userData;

    // Check if the email is already registered
    const isEmailRegistered = await this.userService.isEmailRegistered(email);
    if (isEmailRegistered) {
      throw new BadRequestException('Email already registered'); 
    }

    // Create the user
    const newUser = await this.userService.create(userData);

    // Generate a token for email verification
    const verificationToken = sign(newUser.email, process.env.JWT_SECRET);

    // Send the verification email
    await this.mailerService.sendVerificationEmail(email, verificationToken);
  }

  @Get()
  findAll(): string {
    return 'This action returns all users';
  }

  @Post('login')
  async login(@Body() loginData: { email: string, password: string }): Promise<any> {
    const user = await this.userService.validateUser(loginData.email, loginData.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials or email not verified');
    }

    const jwt = sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
    return { message: 'Login successful', jwt, userId: user.id, role: user.role };
  }

  @Get('verify-email')
  async verifyPostEmail(@Query('token') token: string): Promise<string> {
    const isVerified = await this.userService.verifyEmail(token);

    if (isVerified) {
      return 'Email verified successfully';
    } else {
      throw new BadRequestException('Email verification failed');
    }
  }

  @Get('verify/:token')
async verifyEmail(@Param('token') token: string): Promise<string> {
  try {
    // Verify the token using JWT
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Extract user ID from the token

    // Find the user based on the user ID
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user is already verified (optional)
    if (user.isVerified) {
      return 'Your email is already verified.';
    }

    // Update user's isVerified status to true
    user.isVerified = true;
    await this.usersRepository.save(user);

    return 'Email successfully verified!';
  } catch (error) {
    throw new BadRequestException('Invalid or expired token');
  }
}
  
  @Post('check-email')
  async checkEmail(@Body() { email }: { email: string }): Promise<{ exists: boolean }> {
    const isEmailRegistered = await this.userService.isEmailRegistered(email);
    return { exists: isEmailRegistered };
  }

  @Get('profile')
  async getProfile(@Req() request: Request): Promise<User> {
    // Extract the user's ID from the JWT in the Authorization header.
    const userId = this.getUserIdFromToken(request.headers['authorization']);
    // Fetch the user's details from the database.
    const user = await this.userService.findById(userId);
    // Exclude the password field from the response for security reasons.
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Put(':id')
  async update(@Param('id') userId: string, @Body() userData: User): Promise<User> {
    // Find the user by ID
    const existingUser = await this.userService.findById(Number(userId));
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    // Update user details
    const updatedUser = await this.userService.update(Number(userId), userData);
    return updatedUser;
  }
  
  @Get('current')
  async getCurrentUser(@Req() request: Request): Promise<User> {
    try {
      const userId = this.getUserIdFromToken(request.headers['authorization']);
      const user = await this.userService.findById(userId);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Exclude sensitive information
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new UnauthorizedException('Invalid token or user not found');
    }
  }

  private getUserIdFromToken(authorizationHeader?: string): number {
    console.log('Authorization Header:', authorizationHeader);

    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    // Replace 'Bearer ' with an empty string to get the JWT.
    const token = authorizationHeader.replace('Bearer ', '');
    console.log('Token:', token);

    // Decode the JWT to get the payload.
    const payload = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    console.log('Payload:', payload);

    // Return the user's ID from the payload.
    return payload.userId;
  }

  @Get('all')
  async findAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }
  
  @Get('registrations-by-month')
  async getUserRegistrationsByMonth(@Query('year') year: number) {
    try {
      if (!year) {
        throw new Error('Year is required');
      }
      const userRegistrations = await this.userService.getUserRegistrationByMonth(year);
      return userRegistrations;
    } catch (error) {
      console.error('Error fetching user registrations:', error);
      throw new Error('Could not fetch user registrations');
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: { email: string }): Promise<string> {
    await this.userService.forgotPassword(email);
    return 'OTP sent to your email';
  }

  @Post('verify-otp')
  async verifyOtp(@Body() { email, otp }: { email: string; otp: string }): Promise<string> {
    await this.userService.verifyOtp(email, otp);
    return 'OTP verified successfully';
  }

  @Post('reset-password')
  async resetPassword(@Body() { email, newPassword }: { email: string; newPassword: string }): Promise<string> {
    await this.userService.resetPassword(email, newPassword);
    return 'Password reset successfully';
  }
}
