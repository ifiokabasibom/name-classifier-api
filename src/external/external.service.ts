import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalService {
  constructor(private readonly httpService: HttpService) {}

  async getNameInsights(name: string) {
    try {
      const genderPromise = firstValueFrom(
        this.httpService.get(`https://api.genderize.io/?name=${name}`),
      );

      const agePromise = firstValueFrom(
        this.httpService.get(`https://api.agify.io/?name=${name}`),
      );

      const nationalityPromise = firstValueFrom(
        this.httpService.get(`https://api.nationalize.io/?name=${name}`),
      );

      const [genderRes, ageRes, nationalityRes] = await Promise.all([
        genderPromise,
        agePromise,
        nationalityPromise,
      ]);

      if (!genderRes.data || !ageRes.data || !nationalityRes.data) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Invalid upstream response',
          },
          HttpStatus.BAD_GATEWAY,
        );
      }

      return {
        gender: genderRes.data.gender,
        probability: genderRes.data.probability,
        age: ageRes.data.age,
        nationality: nationalityRes.data.country,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'External API failure',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}