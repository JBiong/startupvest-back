import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateItemDto } from 'src/dto/ItemDto/create-item.dto';
import { UpdateItemDto } from 'src/dto/ItemDto/update-item.dto';
import { Item } from 'src/entities/ItemEntity/item.entity';
import { User } from 'src/entities/user.entity';
import { Startup } from 'src/entities/businessprofileentities/startup.entity';


@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
  ) {}

  findAll() {
    return this.itemRepository.find();
  }

  findOne(id: number) {
    return this.itemRepository.findOne({ where: { id } });
  }

  async findAllByStartup(startupId: number) {
    return this.itemRepository.find({
      where: { startup: { id: startupId } },
    });
  }

  async create(userId: number, createItemDto: CreateItemDto) {
    // Fetch the user along with their associated startups
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cfoStartups'],
    });

    if (!user || user.cfoStartups.length === 0) {
      throw new NotFoundException('User does not belong to any startup');
    }

    // Assume the user (e.g. CFO) is assigned to only one startup
    const assignedStartup = user.cfoStartups[0];

    const newItem = this.itemRepository.create({
      ...createItemDto,
      user,
      startup: assignedStartup,
    });

    return this.itemRepository.save(newItem);
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    const item = await this.itemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    await this.itemRepository.update(id, updateItemDto);

    return this.itemRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const item = await this.itemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    await this.itemRepository.remove(item);

    return { message: 'Item deleted successfully' };
  }

  async findAllByCeo(ceoId: number) {
    // Fetch all startups created by the CEO
    const startups = await this.startupRepository.find({
      where: { ceo: { id: ceoId } },
    });

    if (startups.length === 0) {
      throw new NotFoundException('No startups found for this CEO');
    }

    const startupIds = startups.map((startup) => startup.id);

    // Fetch all items related to these startups
    return this.itemRepository.find({
      where: { startup: { id: In(startupIds) } },
    });
  }

  async findAllByCfo(cfoId: number) {
  return this.itemRepository.find({
    where: { user: { id: cfoId } },
  });
}
}
