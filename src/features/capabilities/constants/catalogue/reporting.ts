import {
  REPORT_CORE_CAPABILITIES,
} from "./reporting/01-report-core";

import {
  DASHBOARD_ENGINE_CAPABILITIES,
} from "./reporting/02-dashboard-engine";

import {
  SCHEDULED_REPORT_CAPABILITIES,
} from "./reporting/03-scheduled-reports";

import {
  EXPORT_ENGINE_CAPABILITIES,
} from "./reporting/04-export-engine";

import {
  BUSINESS_INTELLIGENCE_CAPABILITIES,
} from "./reporting/05-business-intelligence";

import {
  AUDIT_COMPLIANCE_CAPABILITIES,
} from "./reporting/06-audit-compliance";


export const REPORTING_CAPABILITIES = [

  ...REPORT_CORE_CAPABILITIES,

  ...DASHBOARD_ENGINE_CAPABILITIES,

  ...SCHEDULED_REPORT_CAPABILITIES,

  ...EXPORT_ENGINE_CAPABILITIES,

  ...BUSINESS_INTELLIGENCE_CAPABILITIES,

  ...AUDIT_COMPLIANCE_CAPABILITIES,

];