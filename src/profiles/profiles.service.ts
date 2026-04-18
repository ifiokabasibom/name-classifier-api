import {
  Injectable,
  BadRequestException,
  UnprocessableEntityException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity } from './profile.entity/profile.entity';
import { uuidv7 } from 'uuidv7';
import { ExternalService } from '../external/external.service';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepo: Repository<ProfileEntity>,
    private readonly externalService: ExternalService,
  ) {}

  private getAgeGroup(age: number): string {
    if (age <= 12) return 'child';
    if (age <= 19) return 'teenager';
    if (age <= 59) return 'adult';
    return 'senior';
  }

  private formatProfile(profile: ProfileEntity) {
    return {
      id: profile.id,
      name: profile.name,
      gender: profile.gender,
      gender_probability: profile.gender_probability,
      sample_size: profile.sample_size,
      age: profile.age,
      age_group: profile.age_group,
      country_id: profile.country_id,
      country_probability: profile.country_probability,
      created_at: profile.created_at.toISOString(),
    };
  }

  private formatList(profile: ProfileEntity) {
    return {
      id: profile.id,
      name: profile.name,
      gender: profile.gender,
      age: profile.age,
      age_group: profile.age_group,
      country_id: profile.country_id,
    };
  }

  async createProfile(name: any) {
    if (!name) {
      throw new BadRequestException({
        status: 'error',
        message: 'Missing or empty name',
      });
    }

    if (typeof name !== 'string') {
      throw new UnprocessableEntityException({
        status: 'error',
        message: 'Invalid type',
      });
    }

    const normalizedName = name.trim().toLowerCase();

    // IDENTITY CHECK (idempotency)
    const existing = await this.profileRepo.findOne({
      where: { name: normalizedName },
    });

    if (existing) {
      return {
        status: 'success',
        message: 'Profile already exists',
        data: this.formatProfile(existing),
      };
    }

    // ================================
    // EXTERNAL API CALLS (SAFE)
    // ================================

    let genderData: any = {};
    let ageData: any = {};
    let nationalityData: any = {};

    try {
      genderData = await this.externalService.getGender(normalizedName);
    } catch {
      genderData = {};
    }

    try {
      ageData = await this.externalService.getAge(normalizedName);
    } catch {
      ageData = {};
    }

    try {
      nationalityData =
        await this.externalService.getNationality(normalizedName);
    } catch {
      nationalityData = {};
    }

    // ================================
    // SAFE FALLBACK LOGIC
    // ================================

    const gender = genderData?.gender ?? 'unknown';
    const genderProbability = genderData?.probability ?? 0;
    const sampleSize = genderData?.count ?? 0;

    const age = ageData?.age ?? 0;
    const ageGroup = this.getAgeGroup(age);

    const topCountry =
      nationalityData?.country?.length > 0
        ? nationalityData.country.reduce((prev, curr) =>
            curr.probability > prev.probability ? curr : prev,
          )
        : {
            country_id: 'unknown',
            probability: 0,
          };

    // ================================
    // SAVE TO DB (ALWAYS ATTEMPT)
    // ================================

    const profile = this.profileRepo.create({
      id: uuidv7(),
      name: normalizedName,
      gender,
      gender_probability: genderProbability,
      sample_size: sampleSize,
      age,
      age_group: ageGroup,
      country_id: topCountry.country_id,
      country_probability: topCountry.probability,
    });

    await this.profileRepo.save(profile);

    return {
      status: 'success',
      data: this.formatProfile(profile),
    };
  }

  async getAllProfiles(query: any) {
    const qb = this.profileRepo.createQueryBuilder('profile');

    if (query.gender) {
      qb.andWhere('LOWER(profile.gender) = LOWER(:gender)', {
        gender: query.gender,
      });
    }

    if (query.country_id) {
      qb.andWhere('LOWER(profile.country_id) = LOWER(:country_id)', {
        country_id: query.country_id,
      });
    }

    if (query.age_group) {
      qb.andWhere('LOWER(profile.age_group) = LOWER(:age_group)', {
        age_group: query.age_group,
      });
    }

    const profiles = await qb.getMany();

    return {
      status: 'success',
      count: profiles.length,
      data: profiles.map((p) => this.formatList(p)),
    };
  }

  async getProfileById(id: string) {
    const profile = await this.profileRepo.findOne({ where: { id } });

    if (!profile) {
      throw new NotFoundException({
        status: 'error',
        message: 'Profile not found',
      });
    }

    return {
      status: 'success',
      data: this.formatProfile(profile),
    };
  }

  async deleteProfile(id: string) {
    const profile = await this.profileRepo.findOne({ where: { id } });

    if (!profile) {
      throw new NotFoundException({
        status: 'error',
        message: 'Profile not found',
      });
    }

    await this.profileRepo.remove(profile);
  }
}