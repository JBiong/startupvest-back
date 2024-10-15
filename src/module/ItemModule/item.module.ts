import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemController } from '../../controller/ItemController/item.controller';
import { ItemService } from 'src/service/ItemService/item.service';
import { Item } from 'src/entities/ItemEntity/item.entity';
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Item, User, Startup])], // Register TypeORM repositories
  controllers: [ItemController], // Register the Item controller
  providers: [ItemService], // Register the Item service
  exports: [ItemService, TypeOrmModule], // Export the ItemService and TypeORM repositories for use in other modules
})
export class ItemModule {}
