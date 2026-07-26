import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}