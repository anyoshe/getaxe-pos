import type {
  CapabilityDefinition,
  CapabilityProfile,
} from "../types";

import {
  CapabilityRegistry,
} from "./capability-registry";


export class CapabilityResolver {


  constructor(
    private readonly registry =
      new CapabilityRegistry(),
  ) {}



  resolve(
    profile: CapabilityProfile,
  ): CapabilityDefinition[] {


    const resolved =
      new Map<string, CapabilityDefinition>();


    //
    // 1. Default capabilities
    //

    for (const capability of this.registry.all()) {


      const supportedIndustry =
        capability.industries.length === 0 ||
        capability.industries.includes(
          profile.businessType,
        );


      if (
        supportedIndustry &&
        capability.defaultEnabled
      ) {

        resolved.set(
          capability.id,
          capability,
        );

      }

    }



    //
    // 2. User selected capabilities
    //

    for (const capabilityId of profile.enabled) {


      this.addWithDependencies(
        capabilityId,
        resolved,
      );


    }



    //
    // 3. Remove disabled
    //

    for (
      const capabilityId of profile.disabled
    ) {

      resolved.delete(
        capabilityId,
      );

    }


    return Array.from(
      resolved.values(),
    );

  }




  private addWithDependencies(
    capabilityId: string,
    resolved:
      Map<string, CapabilityDefinition>,
  ) {


    const capability =
      this.registry.get(
        capabilityId,
      );


    if (!capability) {
      return;
    }



    if (
      resolved.has(
        capability.id,
      )
    ) {
      return;
    }



    //
    // Resolve dependencies first
    //

    for (
      const dependency of capability.dependencies
    ) {

      this.addWithDependencies(
        dependency,
        resolved,
      );

    }



    resolved.set(
      capability.id,
      capability,
    );

  }


}