import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ControlVerification } from "./entities/control-verification.entity";
import { ControlVerificationsService } from "./control-verifications.service";
import { ControlVerificationsController } from "./control-verifications.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ControlVerification])],
  providers: [ControlVerificationsService],
  controllers: [ControlVerificationsController],
  exports: [ControlVerificationsService],
})
export class ControlVerificationsModule {}
