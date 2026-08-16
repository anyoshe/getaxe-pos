/**
 * Canonical permission actions for the GetAxe ERP.
 *
 * IMPORTANT:
 * - This is the authoritative action vocabulary.
 * - Permission codes are built from these actions.
 * - Roles do not define actions.
 * - Modules/resources determine which actions are meaningful.
 *
 * The catalogue is intentionally broader than today's implementation
 * because the ERP is being designed as a complete, extensible platform.
 */

export const PERMISSION_ACTIONS = {
  // ---------------------------------------------------------------------------
  // Core CRUD
  // ---------------------------------------------------------------------------

  VIEW: "VIEW",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",

  // ---------------------------------------------------------------------------
  // Status / lifecycle
  // ---------------------------------------------------------------------------

  ACTIVATE: "ACTIVATE",
  DEACTIVATE: "DEACTIVATE",

  APPROVE: "APPROVE",
  REJECT: "REJECT",

  CANCEL: "CANCEL",
  CLOSE: "CLOSE",
  REOPEN: "REOPEN",

  COMPLETE: "COMPLETE",
  VOID: "VOID",

  POST: "POST",

  // ---------------------------------------------------------------------------
  // Operational actions
  // ---------------------------------------------------------------------------

  RECEIVE: "RECEIVE",
  ISSUE: "ISSUE",
  TRANSFER: "TRANSFER",

  DISPATCH: "DISPATCH",

  RETURN: "RETURN",
  REFUND: "REFUND",
  EXCHANGE: "EXCHANGE",

  ADJUST: "ADJUST",
  FREEZE: "FREEZE",
  UNFREEZE: "UNFREEZE",

  ALLOCATE: "ALLOCATE",
  RELEASE: "RELEASE",

  CONVERT: "CONVERT",

  // ---------------------------------------------------------------------------
  // Sales / commercial
  // ---------------------------------------------------------------------------

  APPLY: "APPLY",
  REQUEST: "REQUEST",

  DISCOUNT: "DISCOUNT",

  // ---------------------------------------------------------------------------
  // Financial
  // ---------------------------------------------------------------------------

  PAY: "PAY",

  RECEIVE_PAYMENT: "RECEIVE_PAYMENT",
  REVERSE_PAYMENT: "REVERSE_PAYMENT",

  RECONCILE: "RECONCILE",

  WRITE_OFF: "WRITE_OFF",

  // ---------------------------------------------------------------------------
  // Data / documents
  // ---------------------------------------------------------------------------

  IMPORT: "IMPORT",
  EXPORT: "EXPORT",

  PRINT: "PRINT",
  DOWNLOAD: "DOWNLOAD",

  // ---------------------------------------------------------------------------
  // Security / administration
  // ---------------------------------------------------------------------------

  ASSIGN_ROLE: "ASSIGN_ROLE",
  ASSIGN_PERMISSION: "ASSIGN_PERMISSION",

  RESET_PASSWORD: "RESET_PASSWORD",

  IMPERSONATE: "IMPERSONATE",

  // ---------------------------------------------------------------------------
  // Configuration / system
  // ---------------------------------------------------------------------------

  CONFIGURE: "CONFIGURE",

  ENABLE: "ENABLE",
  DISABLE: "DISABLE",

  SYNC: "SYNC",

  EXECUTE: "EXECUTE",

  MANAGE: "MANAGE",
} as const;

export type PermissionAction =
  (typeof PERMISSION_ACTIONS)[keyof typeof PERMISSION_ACTIONS];

export const PERMISSION_ACTION_VALUES = Object.values(
  PERMISSION_ACTIONS,
) as PermissionAction[];
