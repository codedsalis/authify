import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected buildResponse(
    res: any,
    ttl: number,
    limit: number,
    remainingPoints: number,
  ): void {
    Logger.debug(`Calculated TTL: ${ttl}`);
    res.header('X-RateLimit-Limit', limit);
    res.header('X-RateLimit-Remaining', Math.max(0, remainingPoints - 1));
    res.header('X-RateLimit-Reset', Math.ceil(20)); // Ensure TTL is valid
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    // Extract client IP from `X-Forwarded-For` header or use fallback
    const forwarded = req.headers['x-forwarded-for'];
    return forwarded ? forwarded.split(',')[0].trim() : req.ip;
  }
}
