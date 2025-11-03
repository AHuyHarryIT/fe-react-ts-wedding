import { Injectable } from '@nestjs/common';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  create(createGuestDto: CreateGuestDto) {
    return this.prisma.guest.create({
      data: createGuestDto,
    });
  }

  findAll() {
    return this.prisma.guest.findMany({
      include: {
        wedding: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.guest.findUnique({
      where: { id },
      include: {
        wedding: true,
      },
    });
  }

  update(id: string, updateGuestDto: UpdateGuestDto) {
    return this.prisma.guest.update({
      where: { id },
      data: updateGuestDto,
    });
  }

  remove(id: string) {
    return this.prisma.guest.delete({
      where: { id },
    });
  }
}
