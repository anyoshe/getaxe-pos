import type {
  CapabilityCategory,
} from "./capability-category";

import type {
  CapabilityModule,
} from "./capability-module";

import type {
  CapabilityGroup,
} from "../constants/capability-groups";

import type {
  CapabilityStatus,
} from "../constants/capability-status";

export interface CapabilityDefinition {

  /**
   * Unique identifier.
   * Example:
   * inventory.batch-control
   */
  id: string;

  /**
   * Short machine code.
   * Example:
   * BATCH_CONTROL
   */
  code: string;

  /**
   * Display name.
   */
  name: string;

  /**
   * User description.
   */
  description: string;

  /**
   * ERP module.
   */
  module: CapabilityModule;

  /**
   * Functional group.
   */
  group: CapabilityGroup;

  /**
   * Functional category.
   */
  category: CapabilityCategory;

  /**
   * Lifecycle state.
   */
  status: CapabilityStatus;

  /**
   * Industries that may use this capability.
   * Empty array means every industry.
   */
  industries: string[];

  /**
   * Enable automatically for supported industries.
   */
  defaultEnabled: boolean;

  /**
   * Other capabilities required first.
   */
  dependencies: string[];

  /**
   * Capabilities that cannot coexist.
   */
  conflicts: string[];

  /**
   * Database objects influenced.
   *
   * Example:
   * products
   * product_batches
   * sale_items
   */
  schema: string[];

  /**
   * Services affected.
   *
   * Example:
   * inventory
   * purchasing
   * sales
   */
  services: string[];

  /**
   * UI screens affected.
   *
   * Example:
   * products
   * product-dialog
   * sale-screen
   */
  ui: string[];

  /**
   * Workflow hooks.
   *
   * Example:
   * product.create
   * sale.complete
   */
  workflows: string[];

  /**
   * Validation rules enabled.
   */
  validators: string[];

  /**
   * Permissions required.
   */
  permissions: string[];

  /**
   * Feature flags exposed to the frontend.
   */
  featureFlags: string[];

}