/**
 * AuditLog domain entity — Immutable append-only log entry.
 *
 * ═══════════════════════════════════════════════════════════════════
 * IMMUTABILITY (BR-10)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Audit logs are append-only. Once created, an AuditLog entry can
 * never be modified or deleted. This entity has NO business methods
 * that mutate state — only constructor + getters.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Records who did what, on which entity, and when. Used for:
 *   - Security auditing (login/logout, account lock/unlock)
 *   - Compliance (BR-10)
 *   - Admin oversight (job approval, employer verification)
 *
 * @category Domain Entity
 */
export interface AuditLogProps {
  id: string | null;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  timestamp: Date;
}

export class AuditLog {
  private readonly _id: string | null;
  private readonly _actorId: string;
  private readonly _action: string;
  private readonly _entity: string;
  private readonly _entityId: string;
  private readonly _metadata: Record<string, unknown> | null;
  private readonly _timestamp: Date;

  constructor(props: AuditLogProps) {
    this._id = props.id;
    this._actorId = props.actorId;
    this._action = props.action;
    this._entity = props.entity;
    this._entityId = props.entityId;
    this._metadata = props.metadata;
    this._timestamp = props.timestamp;
  }

  // ── Getters (read-only) ──────────────────────────────────────────

  get id(): string | null {
    return this._id;
  }

  get actorId(): string {
    return this._actorId;
  }

  get action(): string {
    return this._action;
  }

  get entity(): string {
    return this._entity;
  }

  get entityId(): string {
    return this._entityId;
  }

  get metadata(): Record<string, unknown> | null {
    return this._metadata;
  }

  get timestamp(): Date {
    return this._timestamp;
  }
}
