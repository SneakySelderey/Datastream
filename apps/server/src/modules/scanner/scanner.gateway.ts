import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Public } from '../auth/public.decorator';
import { ScanProgressDto } from './dto/scan-progress.dto';

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

  private lastProgress: ScanProgressDto = {
    status: 'idle',
    foldersScanned: 0,
    totalFolders: 0,
  };

  handleConnection(client: Socket) {
    client.emit('scan.progress', this.lastProgress);
  }

  emitProgress(progress: ScanProgressDto) {
    this.lastProgress = progress;
    if (this.server) {
      this.server.emit('scan.progress', progress);
    }
  }
}
