import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from './task.dto';
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

  /**
   * §276 / D-007. Declared BEFORE `tasks/:id/status` is not required -- Nest matches the
   * more specific literal segment first -- but the two are kept adjacent so the pair is
   * read together.
   */
  @Patch('tasks/:id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(req.user, id, dto);
  }

  @Delete('tasks/:id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.tasks.remove(req.user, id);
  }

  @Patch('tasks/:id/status')
  updateStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTaskStatusDto) {
    return this.tasks.updateStatus(req.user, id, dto);
  }

  @Get('calendar')
  calendar(@Req() req: any) {
    return this.tasks.calendar(req.user);
  }
}
