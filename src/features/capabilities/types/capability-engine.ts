import type {
  CapabilityDefinition,
} from "./capability";

export interface CapabilityEngine {

  capabilities: CapabilityDefinition[];

  has(
    capabilityId: string,
  ): boolean;

  get(
    capabilityId: string,
  ): CapabilityDefinition | undefined;

  enabled(): CapabilityDefinition[];

  disabled(): CapabilityDefinition[];

}