export type ScanRequestStatus = 'started' | 'already-running';

export class ScanRequestResultDto {
  status!: ScanRequestStatus;
}
