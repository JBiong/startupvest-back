import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { compare, hash } from 'bcrypt'; // Import bcrypt
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { sign } from 'jsonwebtoken'; // Import jsonwebtoken
import { MailService } from './mailer.service';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';
import { InvestorService } from './businessprofileservice/investor.service';


@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Startup)
    private startupRepository: Repository<Startup>,

    private investorService: InvestorService,
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
        isVerified: false
      });
  
       // Associate the CFO with the startup

      const savedCfoUser = await this.usersRepository.save(cfoUser);
      startup.cfo = savedCfoUser;

      await this.startupRepository.save(startup)
      
      const verificationToken = sign({ userId: savedCfoUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      await this.mailService.sendVerificationEmail(savedCfoUser.email, verificationToken);
      return savedCfoUser;

    }

    // For CEO or other roles, create the user (CEO as default)
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword, // Save hashed password
      role, 
      isVerified: false
    });

    const savedUser = await this.usersRepository.save(user);

    if (role === 'Investor') {
      await this.investorService.create(savedUser.id, savedUser);
    }

    const verificationToken = sign({ userId: savedUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await this.mailService.sendVerificationEmail(savedUser.email, verificationToken);
  
    return savedUser;
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

    // Merge the updated data into the existing user object, including the email
    Object.assign(existingUser, userData);

    // Save the updated user data
    const savedUser = await this.usersRepository.save(existingUser);

    // If the user is an investor, also update the investor entity
    if (savedUser.role === 'Investor') {
        const existingInvestor = await this.investorService.findOne(savedUser.id);
        
        if (!existingInvestor) {
            throw new NotFoundException('Investor profile not found');
        }

        // Make sure the investor entity is updated with the new email if it's changed
        if (userData.email) {
            existingInvestor.emailAddress = userData.email;
        }

        // Merge other updated fields into the investor entity if needed
        Object.assign(existingInvestor, userData);

        // Update the investor entity
        await this.investorService.update(existingInvestor.id, existingInvestor);
    }
    return savedUser;
}




  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async getUserRegistrationByMonth(year: number): Promise<any> {
    try {
        // Step 1: Retrieve all users created in the specified year
        const users = await this.usersRepository.createQueryBuilder('user')
            .where('YEAR(user.createdAt) = :year', { year })
            .getMany();

        // Step 2: Group users by month
        const userRegistrations = users.reduce((acc, user) => {
            const month = user.createdAt.toISOString().slice(0, 7); // Format to "YYYY-MM"
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Step 3: Format the result as an array of objects with 'month' and 'count'
        const formattedRegistrations = Object.keys(userRegistrations).map(month => ({
            month,
            count: userRegistrations[month]
        }));

        return formattedRegistrations;
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

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Validate current password
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }
  
    // Hash the new password
    const hashedNewPassword = await hash(newPassword, 10);
  
    // Update user password
    user.password = hashedNewPassword;
    await this.usersRepository.save(user);
  }


  async createDefaultAdmin() {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = '12345';

    const isExist = await this.usersRepository.findOne({
      where: { email: adminEmail },
    });

    if (!isExist) {
      const hashedPassword = await hash(adminPassword, 10);
      const adminUser = this.usersRepository.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
        firstName: 'Admin',
        lastName: 'Account',
      });
      await this.usersRepository.save(adminUser);
      console.log('Default admin account created');
    } else {
      console.log('Default admin account already exists');
    }
  }
  
  

  

}
