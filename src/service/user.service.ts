import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { compare, hash } from 'bcrypt'; // Import bcrypt
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { sign } from 'jsonwebtoken'; // Import jsonwebtoken
import { MailService } from './mailer.service';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';


@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Startup)
    private startupRepository: Repository<Startup>,

    private mailService: MailService, // Add a mail service for sending emails
  ) { }


  async create(userData: User): Promise<User> {
    const hashedPassword = await hash(userData.password, 10);
    const role = userData.role || 'CEO';
    // const user = this.usersRepository.create({ ...userData, password: hashedPassword, isVerified: false });

    // Handle CFO registration with startup code validation
    if (role === 'CFO') {
      if (!userData.startupCode) {
        throw new BadRequestException('Startup code is required for CFO.');
      }
  
      // Check if the startup code exists in the database
      const startup = await this.startupRepository.findOne({
        where: { startupCode: userData.startupCode },
      });
  
      if (!startup) {
        throw new NotFoundException('Invalid startup code.');
      }
  
      // Create the CFO user and associate them with the startup
      const cfoUser = this.usersRepository.create({
        ...userData,
        password: hashedPassword, // Save hashed password
        role: 'CFO', // Assign CFO role
      });
  
      cfoUser.startups = [startup]; // Associate the CFO with the startup
  
      return this.usersRepository.save(cfoUser);
    }

    // For CEO or other roles, create the user (CEO as default)
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword, // Save hashed password
      role, 
      isVerified: false
    });

    const savedUser = await this.usersRepository.save(user);

    const verificationToken = sign({ userId: savedUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await this.mailService.sendVerificationEmail(savedUser.email, verificationToken);
  
    return savedUser;

    // const savedUser = await this.usersRepository.save(user);

    // // Generate a verification token (could be a JWT or unique token)
    // const verificationToken = sign({ userId: savedUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // // Send the verification email with the token
    // await this.mailService.sendVerificationEmail(savedUser.email, verificationToken);

    // return savedUser;
  }

  async verifyUser(token: string): Promise<void> {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
      const user = await this.usersRepository.findOne({ where: { id: decoded.userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.isVerified = true;
      await this.usersRepository.save(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  // Method to find a user by their email
  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  

  async verifyEmail(token: string): Promise<boolean> {
    try {
      // Verify the token (use the same secret key used during token generation)
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user based on the decoded token data (like userId or email)
      const user = await this.usersRepository.findOne({
        where: { id: decoded.userId }, // Assuming the token contains userId
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Mark the user's email as verified
      user.isVerified = true; // Assuming your User entity has an isEmailVerified field
      await this.usersRepository.save(user);

      return true; // Return true if the verification is successful
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
  
  

  // async create(userData: User): Promise<User> {
  //   const hashedPassword = await hash(userData.password, 10); // Hash the password
  //   const role = userData.role || 'user';
  //   const user = this.usersRepository.create({ ...userData, password: hashedPassword });
  //   return this.usersRepository.save(user);
  // }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user && await compare(password, user.password) && user.isVerified) { // Compare the hashed password
      return user;
    }

    return null;
  }

  async isEmailRegistered(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return !!user; // Returns true if user exists, false otherwise
  }

  async findById(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (userData.role) {
      existingUser.role = userData.role; // Update the role if provided
    }
    // Update user details
    const updatedUser = await this.usersRepository.save({ ...existingUser, ...userData });
    return updatedUser;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async getUserRegistrationByMonth(year: number): Promise<any> {
    try {
        const userRegistrations = await this.usersRepository.createQueryBuilder('user')
            .select('DATE_FORMAT(user.createdAt, "%Y-%m")', 'month') // Format to "YYYY-MM"
            .addSelect('COUNT(user.id)', 'count') // This will be a number
            .where('YEAR(user.createdAt) = :year', { year })
            .groupBy('month')
            .getRawMany();

        // Convert count to a number
        const formattedRegistrations = userRegistrations.map(registration => ({
            month: registration.month,
            count: Number(registration.count) // Ensure count is a number
        }));

        return formattedRegistrations; // Return the formatted registrations
    } catch (error) {
        console.error('Error fetching user registrations:', error);
        throw new Error('Could not fetch user registrations');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate OTP (One-Time Password)
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresIn = new Date();
    expiresIn.setMinutes(expiresIn.getMinutes() + 10); // OTP expires in 10 minutes

    user.resetPasswordToken = otp;
    user.resetPasswordExpires = expiresIn;
    
    // Save OTP and expiration time to the user entity
    await this.usersRepository.save(user);

    // Send OTP via email
    await this.mailService.sendOtp(user.email, otp);
  }

  async verifyOtp(email: string, otp: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || user.resetPasswordToken !== otp || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Clear OTP and expiration
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersRepository.save(user);
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);
    user.password = hashedPassword;

    // Save updated password
    await this.usersRepository.save(user);
  }


  
  

  

}
