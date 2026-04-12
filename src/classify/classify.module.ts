import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClassifyController } from './classify.controller';
import { ClassifyService } from './classify.service';

@Module({
  imports: [HttpModule],
  controllers: [ClassifyController],
  providers: [ClassifyService],
})
export class ClassifyModule {}