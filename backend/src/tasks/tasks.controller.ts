import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateTaskDto, UpdateTaskStatusDto } from './task.dto';
import { TasksService } from './tasks.service';

@UseGuards(JwtGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post('tasks')
  create(@Req() req: any, @Body() dto: CreateTaskDto) {
    return this.tasks.create(req.user, dto);
  }

  @Get('tasks')
  list(@Req() req: any) {
    return this.tasks.list(req.user);
  }

  @Patch('tasks/:id/status')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTaskStatusDto) {
    return this.tasks.updateStatus(req.user, id, dto);
  }

  @Get('calendar')
  calendar(@Req() req: any) {
    return this.tasks.calendar(req.user);
  }
}
