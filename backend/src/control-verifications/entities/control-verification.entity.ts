import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("control_verifications")
export class ControlVerification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  reportId: string;

  @Column()
  control: string;

  @Column()
  status: "present" | "missing";

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
