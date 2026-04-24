import { Module } from '@nestjs/common';
import { NaturalLanguageParserService } from './natural-language-parser.service';

@Module({
  providers: [NaturalLanguageParserService],
  exports: [NaturalLanguageParserService],
})
export class CommonModule {}