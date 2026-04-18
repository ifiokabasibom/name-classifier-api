import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassifyModule } from './classify/classify.module';
import { ProfilesModule } from './profiles/profiles.module';
import { HttpModule } from '@nestjs/axios';
import { ExternalModule } from './external/external.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'profiles.db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ClassifyModule, 
    ProfilesModule,
    HttpModule,
    ExternalModule
  ],
})
export class AppModule {}





