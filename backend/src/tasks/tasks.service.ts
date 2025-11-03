import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto) {
    const data: any = { ...createTaskDto };
    if (createTaskDto.dueDate) {
      data.dueDate = new Date(createTaskDto.dueDate);
    }
    return this.prisma.task.create({
      data,
    });
  }

  findAll() {
    return this.prisma.task.findMany({
      include: {
        wedding: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        wedding: true,
      },
    });
  }

  update(id: string, updateTaskDto: UpdateTaskDto) {
    const data: any = { ...updateTaskDto };
    if (updateTaskDto.dueDate) {
      data.dueDate = new Date(updateTaskDto.dueDate);
    }
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
