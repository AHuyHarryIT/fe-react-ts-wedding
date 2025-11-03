import { Injectable } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  create(createVendorDto: CreateVendorDto) {
    return this.prisma.vendor.create({
      data: createVendorDto,
    });
  }

  findAll() {
    return this.prisma.vendor.findMany({
      include: {
        wedding: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.vendor.findUnique({
      where: { id },
      include: {
        wedding: true,
      },
    });
  }

  update(id: string, updateVendorDto: UpdateVendorDto) {
    return this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
    });
  }

  remove(id: string) {
    return this.prisma.vendor.delete({
      where: { id },
    });
  }
}
