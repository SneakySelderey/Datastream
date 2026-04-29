import { Controller, Post } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ScannerService } from './scanner.service';
import { ScanRequestResultDto } from './dto/scan-request-result.dto';

@ApiTags('scanner')
@ApiCookieAuth()
@Controller('scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post('rescan')
  @ApiOperation({ summary: 'Start a quick library rescan' })
  @ApiOkResponse({ type: ScanRequestResultDto })
  async rescan(): Promise<ScanRequestResultDto> {
    const started = await this.scannerService.scanLibrary();
    return this.toScanRequestResult(started);
  }

  @Post('full-rescan')
  @ApiOperation({ summary: 'Start a full library rescan' })
  @ApiOkResponse({ type: ScanRequestResultDto })
  async fullRescan(): Promise<ScanRequestResultDto> {
    const started = await this.scannerService.fullRescanLibrary();
    return this.toScanRequestResult(started);
  }

  private toScanRequestResult(started: boolean): ScanRequestResultDto {
    return { status: started ? 'started' : 'already-running' };
  }
}
