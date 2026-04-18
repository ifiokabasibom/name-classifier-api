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

@Controller('api/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

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
}