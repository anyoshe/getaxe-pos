import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  module?: string;
  permission?: string;
  /** Single capability required to show this nav item */
  capability?: string;
  /** Show if any of these capabilities are enabled */
  anyCapabilities?: string[];
  children?: NavigationItem[];
}
