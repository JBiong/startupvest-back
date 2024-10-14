import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

require('dotenv').config(); // Load environment variables from .env file

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()

	const config = new DocumentBuilder()
		.setTitle("SphereFinVest API")
		.setDescription("API documentation for StartupVest, FinEase, and StartupSphere")
		.setVersion("1.0")
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, document, { yamlDocumentUrl: "/docs/spec.yaml" });

  await app.listen(3000);
}
bootstrap();
