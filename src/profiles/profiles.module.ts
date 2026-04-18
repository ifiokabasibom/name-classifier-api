import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';   
import { ProfileEntity } from './profile.entity/profile.entity';
import { ExternalModule } from '../external/external.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileEntity]),
    ExternalModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}





