import { Controller, Post } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { ScanRequestResultDto } from './dto/scan-request-result.dto';

@Controller('scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post('rescan')
  async rescan(): Promise<ScanRequestResultDto> {
    const started = await this.scannerService.scanLibrary();
    return this.toScanRequestResult(started);
  }

  @Post('full-rescan')
  async fullRescan(): Promise<ScanRequestResultDto> {
    const started = await this.scannerService.fullRescanLibrary();
    return this.toScanRequestResult(started);
  }

  private toScanRequestResult(started: boolean): ScanRequestResultDto {
    return { status: started ? 'started' : 'already-running' };
  }
}
