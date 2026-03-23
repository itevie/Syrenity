import SyUser from "../models/User";

interface BaseAuditLog {
  performer_original_username: string;
  performer_original_id: number;
}

enum MemberAddReason {
  invite,
  applicationDiscovery,
}

interface AuditMemberAdd extends BaseAuditLog {
  user_id: number;
  reason: MemberAddReason;
}

interface AuditMemberKick extends BaseAuditLog {
  user_id: number;
  reason: string;
}

interface AuditLogType {
  MemberAdd: AuditMemberAdd;
  MemberKick: AuditMemberKick;
}

interface AuditLogConfig<T extends keyof AuditLogType> {
  type: T;
  data: AuditLogType[T];
  guild_id: number;
  performer: SyUser;
  performee: SyUser | undefined;
}

function addLog<T extends keyof AuditLogType>(config: AuditLogConfig<T>) {}
