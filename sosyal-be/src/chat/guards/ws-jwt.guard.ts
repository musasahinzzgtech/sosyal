import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth.token;

    if (!token) {
      throw new WsException('Token not provided');
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      client.data.user = decoded;
      return true;
    } catch (err) {
      throw new WsException('Invalid token');
    }
  }
}
