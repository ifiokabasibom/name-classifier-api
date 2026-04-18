import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalService } from './external.service';

@Module({
  imports: [HttpModule],
  providers: [ExternalService],
  exports: [ExternalService],
})
export class ExternalModule {}



