import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { ProfilePicture } from './profile-picture.entity';
import { User } from 'src/entities/user.entity';
import { ProfilePicture } from 'src/entities/profilepictureentities/profilepicture.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';
import { Investor } from 'src/entities/businessprofileentities/investor.entity';


@Injectable()
export class ProfilePictureService {
  constructor(
    @InjectRepository(ProfilePicture)
    private profilePictureRepository: Repository<ProfilePicture>,
  ) {}

  async addProfilePicture(userId: number, pictureData: Buffer): Promise<ProfilePicture> {
    const profilePicture = this.profilePictureRepository.create({
      data: pictureData,
      user: { id: userId } as User,
    });
    return this.profilePictureRepository.save(profilePicture);
  }

  async findProfilePicture(userId: number): Promise<ProfilePicture | undefined> {
    return this.profilePictureRepository.findOne({ where: { user: { id: userId } } });
  }

  // ProfilePictureService
    async updateProfilePicture(userId: number, pictureData: Buffer): Promise<ProfilePicture> {
        let profilePicture = await this.profilePictureRepository.findOne({ where: { user: { id: userId } } });
        
        if (profilePicture) {
        profilePicture.data = pictureData;
        } else {
        // If there's no profile picture, create a new one
        profilePicture = this.profilePictureRepository.create({
            data: pictureData,
            user: { id: userId } as User,
        });
        }
    
        return this.profilePictureRepository.save(profilePicture);
    }

  // ... other methods ...

  async addProfilePictureToStartup(startupId: number, pictureData: Buffer): Promise<ProfilePicture> {
    let profilePicture = await this.profilePictureRepository.findOne({ where: { startup: { id: startupId } } });
    
    if (profilePicture) {
      profilePicture.data = pictureData;
    } else {
      profilePicture = this.profilePictureRepository.create({
        data: pictureData,
        startup: { id: startupId } as any, // Cast to any to satisfy TypeScript
      });
    }

    return this.profilePictureRepository.save(profilePicture);
  }

  async addProfilePictureToInvestor(investorId: number, pictureData: Buffer): Promise<ProfilePicture> {
    let profilePicture = await this.profilePictureRepository.findOne({ where: { investor: { id: investorId } } });
    
    if (profilePicture) {
      profilePicture.data = pictureData;
    } else {
      profilePicture = this.profilePictureRepository.create({
        data: pictureData,
        investor: { id: investorId } as any, // Cast to any to satisfy TypeScript
      });
    }

    return this.profilePictureRepository.save(profilePicture);
  }

  async findProfilePictureForStartup(startupId: number): Promise<ProfilePicture | undefined> {
    return this.profilePictureRepository.findOne({ where: { startup: { id: startupId } } });
  }

  async findProfilePictureForInvestor(investorId: number): Promise<ProfilePicture | undefined> {
    return this.profilePictureRepository.findOne({ where: { investor: { id: investorId } } });
  }

  async updateProfilePictureToStartup(startupId: number, pictureData: Buffer): Promise<ProfilePicture> {
    let profilePicture = await this.profilePictureRepository.findOne({ where: { startup: { id: startupId } } });
  
    if (profilePicture) {
      profilePicture.data = pictureData;
    } else {
      profilePicture = this.profilePictureRepository.create({
        data: pictureData,
        startup: { id: startupId } as Startup,
      });
    }
  
    return this.profilePictureRepository.save(profilePicture);
  }

  async updateProfilePictureToInvestor(investorId: number, pictureData: Buffer): Promise<ProfilePicture> {
    let profilePicture = await this.profilePictureRepository.findOne({ where: { investor: { id: investorId } } });
  
    if (profilePicture) {
      profilePicture.data = pictureData;
    } else {
      profilePicture = this.profilePictureRepository.create({
        data: pictureData,
        investor: { id: investorId } as Investor,
      });
    }
  
    return this.profilePictureRepository.save(profilePicture);
  }

}
