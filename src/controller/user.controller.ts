import { Controller, Post, Body, Get, UnauthorizedException, Req, Put, Param, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/service/user.service';
import { User } from 'src/entities/user.entity';
import { sign } from 'jsonwebtoken'; // Import jsonwebtoken
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) { }

  @Post('register')
  async create(@Body() userData: User): Promise<void> {
    const { email } = userData;
    const isEmailRegistered = await this.userService.isEmailRegistered(email);
    if (isEmailRegistered) {
      throw new Error('Email already registered');
    }
    await this.userService.create(userData);
  }

  @Get()
  findAll(): string {
    return 'This action returns all users';
  }

  @Post('login')
  async login(@Body() loginData: { email: string, password: string }): Promise<any> {
    const user = await this.userService.validateUser(loginData.email, loginData.password);

    if (!user) {
      throw new UnauthorizedException();
    }

    const jwt = sign({ userId: user.id }, 'secretKey'); // Sign the JWT with the user's ID

    return { message: 'Login successful', jwt, userId: user.id };
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

  private getUserIdFromToken(authorizationHeader?: string): number {
    console.log('Authorization Header:', authorizationHeader);

    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    // Replace 'Bearer ' with an empty string to get the JWT.
    const token = authorizationHeader.replace('Bearer ', '');
    console.log('Token:', token);

    // Decode the JWT to get the payload.
    const payload = jwt.verify(token, 'secretKey');
    console.log('Payload:', payload);

    // Return the user's ID from the payload.
    return payload.userId;
  }

  @Get('all')
  async findAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }
}
