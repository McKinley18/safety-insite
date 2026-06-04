import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassificationRule } from './entities/rule.entity';
import { ClassificationRuleVersion } from './entities/rule-version.entity';
import { AuditService } from '../audit/audit.service';
import { HAZARD_CATEGORIES, SEVERITY_LEVELS } from './taxonomy.config';

@Injectable()
export class TaxonomyService {
  constructor(
    @InjectRepository(ClassificationRule)
    private ruleRepo: Repository<ClassificationRule>,
    @InjectRepository(ClassificationRuleVersion)
    private versionRepo: Repository<ClassificationRuleVersion>,
    private auditService: AuditService,
  ) {}

  getHazardCategories() {
    return HAZARD_CATEGORIES;
  }

  getSeverityLevels() {
    return SEVERITY_LEVELS;
  }

  async findAllRules() {
    return this.ruleRepo.find();
  }

  async createRule(dto: any, userId: string) {
    if (!/^[a-z_]+$/.test(dto.code)) {
      throw new Error('Code must be lowercase and underscored');
    }

    if (dto.severity < 1 || dto.severity > 5) {
      throw new Error('Severity must be 1-5');
    }

    if (dto.isActive && (!dto.keywords || dto.keywords.length === 0)) {
      throw new Error('Active rules must have keywords');
    }

    const existing = await this.ruleRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new Error('Code already exists');
    }

    const rule: ClassificationRule = this.ruleRepo.create(dto as Partial<ClassificationRule>);
    const saved = await this.ruleRepo.save(rule);

    await this.auditService.log({
      entityType: 'TAXONOMY_RULE',
      entityId: saved.id,
      actionCode: 'RULE_CREATED',
      afterJson: saved,
      actorUserId: userId,
    });

    return saved;
  }

  async rollbackRule(ruleId: string, versionId: string, userId: string) {
    const version = await this.versionRepo.findOne({ where: { id: versionId } });
    if (!version) {
      throw new Error('Version not found');
    }

    const rule = await this.ruleRepo.findOne({ where: { id: ruleId } });
    if (!rule) {
      throw new Error('Rule not found');
    }

    const before = { ...rule };
    Object.assign(rule, version.snapshot);
    const saved = await this.ruleRepo.save(rule);

    await this.auditService.log({
      entityType: 'TAXONOMY_RULE',
      entityId: saved.id,
      actionCode: 'RULE_ROLLED_BACK',
      beforeJson: before,
      afterJson: saved,
      metadataJson: { versionId },
      actorUserId: userId,
    });

    return saved;
  }
}
