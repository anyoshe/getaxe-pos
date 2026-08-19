import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  module?: string;
  permission?: string;
  children?: NavigationItem[];
}