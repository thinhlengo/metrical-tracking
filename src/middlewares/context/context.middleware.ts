import { Injectable, NestMiddleware } from '@nestjs/common';
import { ContextService } from './context.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(private readonly contextService: ContextService) {}
  
  use(req: any, res: any, next: () => void) {
    this.contextService.run(() => {
      const requestId = req.headers['x-request-id'] || uuidv4();
      this.contextService.setContext('requestId', requestId);
      next(); 
    });
  }
}
