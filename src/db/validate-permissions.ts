import {
  validatePermissions,
} from "@/features/permissions/services/permission-validator";

const result = validatePermissions();

if (!result.valid) {
  console.error("Permission validation failed:");

  for (const error of result.errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("Permission validation passed.");
