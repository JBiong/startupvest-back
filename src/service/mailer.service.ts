import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    console.log('GMAIL_USER:', process.env.GMAIL_USER);
    console.log('GMAIL_PASS:', process.env.GMAIL_PASS);
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER, // use environment variable
        pass: process.env.GMAIL_PASS,   // use environment variable
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `https://startupvest-back.up.railway.app/users/verify/${token}`;
    
    await this.transporter.sendMail({
      from: 'no-reply@investtrack.com',
      to: email,
      subject: 'Confirm Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #004A98;">Welcome to InvestTrack!</h2>
          <p>Thank you for signing up! We're excited to have you on board.</p>
          <p>To complete your registration, please confirm your email address:</p>        
          <p style="text-align: left; margin-top: 20px;">
            <a href="${verificationUrl}" 
               style="background-color: #004A98; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Verify Your Email
            </a>
          </p>
  
          <p style="margin-top: 20px;">If you did not create this account, please ignore this email.</p>
          <p style="margin-top: 40px;">Best regards,<br>InvestTrack Team</p>
        </div>
      `,
    });
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: 'no-reply@investtrack.com',
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #FF6F61;">Password Reset Request</h2>
          <p>We received a request to reset your password. Please use the OTP below to proceed:</p>
          <p style="font-size: 20px; font-weight: bold; color: #FF6F61;">${otp}</p>
          <p>This OTP is valid for the next 10 minutes. If you did not request a password reset, please disregard this email.</p>
  
          <p style="margin-top: 40px;">Best regards,<br>InvestTrack Team</p> 
        </div>
      `,
    });
  }
}