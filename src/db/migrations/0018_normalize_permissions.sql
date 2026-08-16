CREATE OR REPLACE FUNCTION migrate_permission_code(old_code text, new_code text) RETURNS void AS $$
DECLARE
  old_id uuid;
  new_id uuid;
BEGIN
  SELECT id INTO old_id FROM permissions WHERE code = old_code;
  SELECT id INTO new_id FROM permissions WHERE code = new_code;

  IF old_id IS NULL OR old_id = new_id THEN
    RETURN;
  END IF;

  IF new_id IS NULL THEN
    UPDATE permissions
    SET code = new_code, updated_at = now()
    WHERE id = old_id;

    RETURN;
  END IF;

  INSERT INTO role_permissions (role_id, permission_id)
  SELECT role_id, new_id
  FROM role_permissions
  WHERE permission_id = old_id
  ON CONFLICT DO NOTHING;

  INSERT INTO user_permissions (user_id, permission_id)
  SELECT user_id, new_id
  FROM user_permissions
  WHERE permission_id = old_id
  ON CONFLICT DO NOTHING;

  DELETE FROM role_permissions WHERE permission_id = old_id;
  DELETE FROM user_permissions WHERE permission_id = old_id;
  DELETE FROM permissions WHERE id = old_id;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
SELECT migrate_permission_code('sale.create', 'sales.create');
--> statement-breakpoint
SELECT migrate_permission_code('sale.complete', 'sales.complete');
--> statement-breakpoint
SELECT migrate_permission_code('sale.return', 'sales.returns.create');
--> statement-breakpoint
SELECT migrate_permission_code('sale.refund', 'sales.returns.refund');
--> statement-breakpoint
SELECT migrate_permission_code('sale.exchange', 'sales.returns.exchange');
--> statement-breakpoint
SELECT migrate_permission_code('sale.recurring', 'sales.create');
--> statement-breakpoint
SELECT migrate_permission_code('sale.sync', 'sales.update');
--> statement-breakpoint
SELECT migrate_permission_code('customer.create', 'customers.create');
--> statement-breakpoint
SELECT migrate_permission_code('customer.loyalty', 'loyalty.manage');
--> statement-breakpoint
SELECT migrate_permission_code('quotation.create', 'quotations.create');
--> statement-breakpoint
SELECT migrate_permission_code('quotation.convert', 'quotations.convert');
--> statement-breakpoint
SELECT migrate_permission_code('order.create', 'sales.orders.create');
--> statement-breakpoint
SELECT migrate_permission_code('order.confirm', 'sales.orders.approve');
--> statement-breakpoint
SELECT migrate_permission_code('order.complete', 'sales.orders.complete');
--> statement-breakpoint
SELECT migrate_permission_code('delivery.create', 'deliveries.create');
--> statement-breakpoint
SELECT migrate_permission_code('delivery.complete', 'deliveries.complete');
--> statement-breakpoint
SELECT migrate_permission_code('discount.request', 'discounts.create');
--> statement-breakpoint
SELECT migrate_permission_code('discount.approve', 'discounts.approve');
--> statement-breakpoint
SELECT migrate_permission_code('promotion.apply', 'promotions.apply');
--> statement-breakpoint
SELECT migrate_permission_code('account.create', 'accounts.create');
--> statement-breakpoint
SELECT migrate_permission_code('account.update', 'accounts.update');
--> statement-breakpoint
SELECT migrate_permission_code('payment.receive', 'sales.payments.receive');
--> statement-breakpoint
SELECT migrate_permission_code('payment.complete', 'payments.post');
--> statement-breakpoint
SELECT migrate_permission_code('payment.deposit', 'payments.create');
--> statement-breakpoint
SELECT migrate_permission_code('payment.reconcile', 'payments.reconcile');
--> statement-breakpoint
SELECT migrate_permission_code('payment.refund', 'sales.returns.refund');
--> statement-breakpoint
SELECT migrate_permission_code('expense.create', 'expenses.create');
--> statement-breakpoint
SELECT migrate_permission_code('expense.submit', 'expenses.create');
--> statement-breakpoint
SELECT migrate_permission_code('expense.approve', 'expenses.approve');
--> statement-breakpoint
SELECT migrate_permission_code('journal.create', 'journals.create');
--> statement-breakpoint
SELECT migrate_permission_code('journal.post', 'journals.post');
--> statement-breakpoint
SELECT migrate_permission_code('tax.calculate', 'taxes.view');
--> statement-breakpoint
SELECT migrate_permission_code('tax.create', 'taxes.create');
--> statement-breakpoint
SELECT migrate_permission_code('tax.update', 'taxes.update');
--> statement-breakpoint
SELECT migrate_permission_code('period.close', 'fiscal_periods.close');
--> statement-breakpoint
SELECT migrate_permission_code('report.create', 'reports.create');
--> statement-breakpoint
SELECT migrate_permission_code('report.generate', 'reports.execute');
--> statement-breakpoint
SELECT migrate_permission_code('report.print', 'reports.print');
--> statement-breakpoint
SELECT migrate_permission_code('report.schedule', 'reports.create');
--> statement-breakpoint
SELECT migrate_permission_code('report.update', 'reports.update');
--> statement-breakpoint
DROP FUNCTION migrate_permission_code(text, text);
