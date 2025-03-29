import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityLog, SecurityEventType } from './security-log.entity';
import { SecuritySettingsService } from './security-settings.service';
import { Request } from 'express';

@Injectable()
export class SecurityLogService {
  constructor(
    @InjectRepository(SecurityLog)
    private securityLogRepository: Repository<SecurityLog>,
    private securitySettingsService: SecuritySettingsService,
  ) {}

  async getSecurityLogs(page: number = 1, limit: number = 10) {
    const [logs, total] = await this.securityLogRepository.findAndCount({
      order: {
        timestamp: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async logSecurityEvent(
    event: SecurityEventType,
    ip: string,
    details?: string,
    userId?: string,
  ) {
    const log = this.securityLogRepository.create({
      event,
      ip,
      details,
      userId,
      timestamp: new Date(),
    });

    return this.securityLogRepository.save(log);
  }

  getClientIp(request: Request): string {
    return request.ip || 
           (request.headers['x-forwarded-for'] as string) || 
           'unknown';
  }
}
