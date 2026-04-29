export type ScanStatus =
  | 'idle'
  | 'running'
  | 'finalizing'
  | 'completed'
  | 'failed';

export class ScanProgressDto {
  status!: ScanStatus;
  foldersScanned!: number;
  totalFolders!: number;
  message?: string;
  startedAt?: string;
  finishedAt?: string;
}
