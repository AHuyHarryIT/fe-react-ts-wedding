import { Priority } from '@prisma/client';

export class CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: Date;
  completed?: boolean;
  priority?: Priority;
  weddingId: string;
}
