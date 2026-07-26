import type { ReactNode } from "react";

export interface CrudColumn<T> {
  key: keyof T | string;

  title: string;

  render?: (row: T) => ReactNode;

  align?: "left" | "center" | "right";

  sortable?: boolean;

  width?: string | number;

  /**
   * Hide on tablet/mobile.
   */
  hidden?: boolean;

  /**
   * Show as a secondary line
   * on mobile cards.
   */
  mobile?: boolean;

  /**
   * Higher priority fields
   * always stay visible.
   */
  priority?: boolean;
}

export interface CrudAction<T> {
  label: string;

  onClick: (row: T) => void;

  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive";

  disabled?: (row: T) => boolean;

  icon?: ReactNode;
}

export interface CrudFilter {
  key: string;

  label: string;

  options: {
    label: string;
    value: string;
  }[];
}

export interface PaginationMeta {
  page: number;

  pageSize: number;

  totalItems: number;

  totalPages: number;
}

export interface CrudPageProps {
  title: string;

  description?: string;

  createLabel?: string;

  onCreate?: () => void;

  children: ReactNode;
}

export interface CrudToolbarProps {
  search?: string;

  onSearchChange?: (value: string) => void;

  filters?: CrudFilter[];

  actions?: ReactNode;

  createButton?: ReactNode;
}

export interface CrudTableProps<T> {
  data: T[];

  columns: CrudColumn<T>[];

  actions?: CrudAction<T>[];

  loading?: boolean;

  emptyMessage?: string;
}

export interface CrudDialogProps {
  open: boolean;

  title: string;

  description?: string;

  onOpenChange: (open: boolean) => void;

  children: ReactNode;
}

export interface DeleteDialogProps {
  open: boolean;

  title?: string;

  description?: string;

  loading?: boolean;

  onCancel: () => void;

  onConfirm: () => void;
}

export interface FormActionsProps {
  loading?: boolean;

  submitLabel?: string;

  cancelLabel?: string;

  onCancel?: () => void;
}

export interface StatusBadgeProps {
  active: boolean;

  activeLabel?: string;

  inactiveLabel?: string;
}