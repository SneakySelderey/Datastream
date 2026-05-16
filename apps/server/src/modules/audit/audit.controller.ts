import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('audit')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'User is not authenticated' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@Controller('admin/audit-log')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit log (admin only)' })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'userId', required: false })
  findAll(@Req() req, @Query() query: AuditQueryDto) {
    const user = req.user as any;

    if (!user?.isAdmin) {
      throw new UnauthorizedException(
        'Only administrators can access audit logs',
      );
    }

    return this.auditService.findAll(query);
  }
}
