import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParseTextDto } from './dto/parse-text.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-transaction')
  async parseText(@Req() req, @Body() dto: ParseTextDto) {
    return this.aiService.parseText(req.user.userId, dto.text);
  }

  @Post('save-transaction')
  async parseAndSave(@Req() req, @Body() dto: ParseTextDto) {
    return this.aiService.parseAndSave(req.user.userId, dto.text);
  }
}
