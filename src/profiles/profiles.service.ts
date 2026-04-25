import {
  Injectable,
  BadRequestException,
  UnprocessableEntityException,
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
      age: profile.age,
      age_group: profile.age_group,
      country_id: profile.country_id,
      country_name: profile.country_name,
      country_probability: profile.country_probability,
      created_at: profile.created_at instanceof Date
        ? profile.created_at.toISOString()
        : new Date(profile.created_at).toISOString(),
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
        message: 'Invalid parameter type',
      });
    }

    const normalizedName = name.trim().toLowerCase();

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

    let genderData: any = {};
    let ageData: any = {};
    let nationalityData: any = {};

    try {
      genderData = await this.externalService.getGender(normalizedName);
    } catch {}

    try {
      ageData = await this.externalService.getAge(normalizedName);
    } catch {}

    try {
      nationalityData =
        await this.externalService.getNationality(normalizedName);
    } catch {}

    const gender = genderData?.gender ?? 'unknown';
    const genderProbability = genderData?.probability ?? 0;

    const age = ageData?.age ?? 0;
    const ageGroup = this.getAgeGroup(age);

    const topCountry =
      nationalityData?.country?.length > 0
        ? nationalityData.country.reduce((prev, curr) =>
            curr.probability > prev.probability ? curr : prev,
          )
        : {
            country_id: 'unknown',
            country_name: 'unknown',
            probability: 0,
          };

    const profile = this.profileRepo.create({
      id: uuidv7(),
      name: normalizedName,
      gender,
      gender_probability: genderProbability,
      age,
      age_group: ageGroup,
      country_id: topCountry.country_id || topCountry.id || 'unknown',
      country_name: topCountry.country_name || 'unknown',
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

    // FILTERS

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

    if (query.min_age != undefined) {
      const minAge = Number(query.min_age);
      if (isNaN(minAge)) {
        throw new UnprocessableEntityException({
          status: 'error',
          message: 'Invalid query parameters',
        });
      }

      qb.andWhere('profile.age >= :minAge', {
        minAge,
      });
    }

    if (query.max_age != undefined) {
      const maxAge = Number(query.max_age);
      if (isNaN(maxAge)) {
        throw new UnprocessableEntityException({
          status: 'error',
          message: 'Invalid query parameters',
        });
      }

      qb.andWhere('profile.age <= :maxAge', {
        maxAge,
      });
    }

    if (query.min_gender_probability) {
      const minGenderProbability = Number(
        query.min_gender_probability,
      );

      if (isNaN(minGenderProbability)) {
        throw new UnprocessableEntityException({
          status: 'error',
          message: 'Invalid query parameters',
        });
      }

      qb.andWhere(
        'profile.gender_probability >= :minGenderProbability',
        {
          minGenderProbability,
        },
      );
    }

    if (query.min_country_probability) {
      const minCountryProbability = Number(
        query.min_country_probability,
      );

      if (isNaN(minCountryProbability)) {
        throw new UnprocessableEntityException({
          status: 'error',
          message: 'Invalid query parameters',
        });
      }

      qb.andWhere(
        'profile.country_probability >= :minCountryProbability',
        {
          minCountryProbability,
        },
      );
    }

    // SORTING

    const allowedSortFields = [
      'age',
      'created_at',
      'gender_probability',
    ];

    const sortBy = allowedSortFields.includes(query.sort_by)
      ? query.sort_by
      : 'created_at';

    const order =
      query.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`profile.${sortBy}`, order);

    // PAGINATION

    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 10, 50);

    qb.skip((page - 1) * limit).take(limit);

    const [profiles, total] = await qb.getManyAndCount();

    return {
      status: 'success',
      page,
      limit,
      total,
      data: profiles.map((profile) =>
        this.formatProfile(profile),
      ),
    };
  }

  async getProfileById(id: string) {
    const profile = await this.profileRepo.findOne({
      where: { id },
    });

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
    const profile = await this.profileRepo.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException({
        status: 'error',
        message: 'Profile not found',
      });
    }

    await this.profileRepo.remove(profile);

    return {
      status: 'success',
      message: 'Profile deleted successfully',
    };
  }
}