import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesModule } from './profiles/profiles.module';
import { ExternalModule } from './external/external.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { NaturalLanguageParserService } from './common/natural-language-parser.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60,   // 60 seconds window
        limit: 10, // max 10 requests
      },
    ]),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'profiles.db',
      autoLoadEntities: true,
      synchronize: true,
    }),

    ProfilesModule,
    ExternalModule,
  ],

  providers: [
    NaturalLanguageParserService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],

  exports: [NaturalLanguageParserService],
})
export class AppModule {}




