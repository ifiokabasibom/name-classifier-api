import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { NaturalLanguageParserService } from '../common/natural-language-parser.service';
import { BadRequestException } from '@nestjs/common';



@Controller('api/profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly parser: NaturalLanguageParserService,
  ) {}

  @Post()
  async createProfile(@Body() body: { name: any }) {
    return this.profilesService.createProfile(body?.name);
  }

  @Get()
  async getAllProfiles(@Query() query: any) {
    return this.profilesService.getAllProfiles(query);
  }

  @Get(':id')
  async getProfileById(@Param('id') id: string) {
    return this.profilesService.getProfileById(id);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteProfile(@Param('id') id: string) {
    await this.profilesService.deleteProfile(id);
  }

  @Get('search')
    async search(@Query('q') q: string, @Query() query: any) {
    try {
        const parsed = this.parser.parse(q);

        return this.profilesService.getAllProfiles({
        ...query,
        ...parsed,
        });
        } catch (e) {
            throw new BadRequestException({
            status: 'error',
            message: 'Unable to interpret query',
            });
        }
    }
  
}