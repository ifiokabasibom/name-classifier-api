import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ClassifyService {
  constructor(private readonly httpService: HttpService) {}

  async classifyName(name: string) {
    try {
      const url = `https://api.genderize.io?name=${name}`;

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 }),
      );

      const { gender, probability, count } = response.data;

      // Edge case handling
      if (!gender || count === 0) {
        throw new HttpException(
          {
            status: 'error',
            message: 'No prediction available for the provided name',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      // Ensure correct types
      const prob = Number(probability);
      const sample = Number(count);

      // Confidence logic
      const is_confident = prob >= 0.7 && sample >= 100;

      return {
        status: 'success',
        data: {
          name,
          gender,
          probability: prob,
          sample_size: sample,
          is_confident,
          processed_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      // Preserve known errors (VERY IMPORTANT)
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle unknown/external API errors
      throw new HttpException(
        {
          status: 'error',
          message: 'Upstream or server failure',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}