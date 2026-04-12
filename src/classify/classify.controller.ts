import { Controller, Get, Query } from '@nestjs/common';
import { ClassifyService } from './classify.service';
import { ClassifyDto } from './dto/classify.dto';


//HANDLING MANUALLY
// @Controller('api')
// export class ClassifyController {
//   constructor(private readonly classifyService: ClassifyService) {}

//   @Get('classify')
//   async classify(@Query('name') name: any) {
//     // Missing
//     if (!name) {
//       throw new HttpException(
//         { status: 'error', message: 'Missing name parameter' },
//         HttpStatus.BAD_REQUEST,
//       );
//     }

//     // Type check
//     if (typeof name !== 'string') {
//       throw new HttpException(
//         { status: 'error', message: 'name must be a string' },
//         HttpStatus.UNPROCESSABLE_ENTITY,
//       );
//     }

//     return this.classifyService.classifyName(name);
//   }
// }



//Letting NESTJS do the work
@Controller('api')
export class ClassifyController {
  constructor(private readonly classifyService: ClassifyService) {}

  @Get('classify')
  classify(@Query() query: ClassifyDto) {
    return this.classifyService.classifyName(query.name);
  }
}