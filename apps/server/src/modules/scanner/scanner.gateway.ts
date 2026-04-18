import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Public } from '../auth/public.decorator';

export type ScanStatus = 'idle' | 'running' | 'finalizing' | 'completed' | 'failed';

export interface ScanProgressPayload {
  status: ScanStatus;
  foldersScanned: number;
  totalFolders: number;
  message?: string;
  startedAt?: string;
  finishedAt?: string;
}

@WebSocketGateway({
  namespace: '/scanner',
  cors: {
    origin: true,
    credentials: true,
  },
})

@Public()
export class ScannerGateway {
  @WebSocketServer()
  server!: Server;

  private lastProgress: ScanProgressPayload = {
    status: 'idle',
    foldersScanned: 0,
    totalFolders: 0,
  };

  handleConnection(client: Socket) {
    client.emit('scan.progress', this.lastProgress);
  }

  emitProgress(progress: ScanProgressPayload) {
    this.lastProgress = progress;
    if (this.server) {
      this.server.emit('scan.progress', progress);
    }
  }
}
