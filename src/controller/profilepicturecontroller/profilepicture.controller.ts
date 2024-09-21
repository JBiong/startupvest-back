import { Controller, Post, UseInterceptors, UploadedFile, Param, Get, Res, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilePictureService } from 'src/service/profilepictureservice/profilepicture.service';
import { Response } from 'express';
// import { ProfilePictureService } from './profile-picture.service';

@Controller('profile-picture')
export class ProfilePictureController {
  constructor(private readonly profilePictureService: ProfilePictureService) {}

  @Post(':userId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(@Param('userId') userId: number, @UploadedFile() file: Express.Multer.File) {
    const pictureData = file.buffer;
    await this.profilePictureService.addProfilePicture(userId, pictureData);
  }

  @Get(':userId')
  async getProfilePicture(@Param('userId') userId: number, @Res() res: Response) {
    const profilePicture = await this.profilePictureService.findProfilePicture(userId);
    if (profilePicture) {
      res.set('Content-Type', 'image/jpeg'); // or the correct content type for your image
      res.send(profilePicture.data);
    } else {
      res.status(404).send('Profile picture not found');
    }
  }

  // ProfilePictureController
    @Put(':userId')
    @UseInterceptors(FileInterceptor('file'))
    async updateProfilePicture(@Param('userId') userId: number, @UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    const pictureData = file.buffer;
    try {
        const updatedProfilePicture = await this.profilePictureService.updateProfilePicture(userId, pictureData);
        res.json(updatedProfilePicture);
    } catch (error) {
        res.status(500).send('Error updating profile picture');
    }
    }

  // ... other endpoints ...

  @Post('startup/:startupId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStartupProfilePicture(@Param('startupId') startupId: number, @UploadedFile() file: Express.Multer.File) {
    const pictureData = file.buffer;
    await this.profilePictureService.addProfilePictureToStartup(startupId, pictureData);
  }

  @Post('investor/:investorId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInvestorProfilePicture(@Param('investorId') investorId: number, @UploadedFile() file: Express.Multer.File) {
    const pictureData = file.buffer;
    await this.profilePictureService.addProfilePictureToInvestor(investorId, pictureData);
  }

  @Get('startup/:startupId')
  async getStartupProfilePicture(@Param('startupId') startupId: number, @Res() res: Response) {
    const profilePicture = await this.profilePictureService.findProfilePictureForStartup(startupId);
    if (profilePicture) {
      res.set('Content-Type', profilePicture.contentType || 'image/jpeg'); 
      res.send(profilePicture.data);
    } else {
      // Send a 204 status to indicate no profile picture found without causing an error
      res.status(204).send(); 
    }
  }

  @Get('investor/:investorId')
  async getInvestorProfilePicture(@Param('investorId') investorId: number, @Res() res: Response) {
    const profilePicture = await this.profilePictureService.findProfilePictureForInvestor(investorId);
    if (profilePicture) {
      res.set('Content-Type', profilePicture.contentType || 'image/jpeg'); 
      res.send(profilePicture.data);
    } else {
      // Send a 204 status to avoid console errors
      res.status(204).send();
    }
  }

  @Put('startup/:startupId/update')
  @UseInterceptors(FileInterceptor('file'))
  async updateStartupProfilePicture(
    @Param('startupId') startupId: number,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
  ) {
    try {
      const pictureData = file.buffer;
      const updatedProfilePicture = await this.profilePictureService.updateProfilePictureToStartup(startupId, pictureData);
      res.json(updatedProfilePicture);
    } catch (error) {
      res.status(500).send('Error updating profile picture');
    }
  }

  @Put('investor/:investorId/update')
  @UseInterceptors(FileInterceptor('file'))
  async updateInvestorProfilePicture(
    @Param('investorId') investorId: number,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
  ) {
    try {
      const pictureData = file.buffer;
      const updatedProfilePicture = await this.profilePictureService.updateProfilePictureToInvestor(investorId, pictureData);
      res.json(updatedProfilePicture);
    } catch (error) {
      res.status(500).send('Error updating profile picture');
    }
  }

}
