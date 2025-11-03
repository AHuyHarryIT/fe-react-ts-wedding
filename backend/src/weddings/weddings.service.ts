import { Injectable } from '@nestjs/common';
import { CreateWeddingDto } from './dto/create-wedding.dto';
import { UpdateWeddingDto } from './dto/update-wedding.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WeddingsService {
  constructor(private prisma: PrismaService) {}

  create(createWeddingDto: CreateWeddingDto) {
    return this.prisma.wedding.create({
      data: {
        ...createWeddingDto,
        weddingDate: new Date(createWeddingDto.weddingDate),
      },
    });
  }

  findAll() {
    return this.prisma.wedding.findMany({
      include: {
        user: true,
        guests: true,
        vendors: true,
        tasks: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.wedding.findUnique({
      where: { id },
      include: {
        user: true,
        guests: true,
        vendors: true,
        tasks: true,
      },
    });
  }

  update(id: string, updateWeddingDto: UpdateWeddingDto) {
    const data: any = { ...updateWeddingDto };
    if (updateWeddingDto.weddingDate) {
      data.weddingDate = new Date(updateWeddingDto.weddingDate);
    }
    return this.prisma.wedding.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.wedding.delete({
      where: { id },
    });
  }
}
