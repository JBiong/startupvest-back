import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { compare, hash } from 'bcrypt'; // Import bcrypt
import { Startup } from 'src/entities/businessprofileentities/startup.entity';


@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Startup)
    private startupRepository: Repository<Startup>,

  ) { }


  async create(userData: User): Promise<User> {
    const hashedPassword = await hash(userData.password, 10); // Hash the password
    const role = userData.role || 'CEO'; // Default to CEO if no role is provided
  
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
    });
  
    return this.usersRepository.save(user);
  }
  
  

  // async create(userData: User): Promise<User> {
  //   const hashedPassword = await hash(userData.password, 10); // Hash the password
  //   const role = userData.role || 'user';
  //   const user = this.usersRepository.create({ ...userData, password: hashedPassword });
  //   return this.usersRepository.save(user);
  // }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user && await compare(password, user.password)) { // Compare the hashed password
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


  
  

  

}
