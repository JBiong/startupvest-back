import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { UserService } from './service/user.service';

require('dotenv').config(); // Load environment variables from .env file

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()

  const userService = app.get(UserService);
  await userService.createDefaultAdmin();
	
  await app.listen(3000);
  
}
bootstrap();
