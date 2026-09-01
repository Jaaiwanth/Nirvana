import { Response } from 'express';

export interface SSEEvent {
  event: string;
  data: any;
  id?: string;
}

export class SSEHub {
  private clients: Set<Response> = new Set();

  /**
   * Registers an incoming HTTP response as an active SSE client stream.
   */
  registerClient(res: Response): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to NIRVANA Real-time Stream' })}\n\n`);

    this.clients.add(res);

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  /**
   * Broadcasts a typed event payload to all connected SSE clients.
   */
  broadcast(eventName: string, payload: any): void {
    const message = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.clients) {
      client.write(message);
    }
  }

  /**
   * Returns current count of connected dashboards.
   */
  getConnectedClientCount(): number {
    return this.clients.size;
  }
}

export const sseHub = new SSEHub();
