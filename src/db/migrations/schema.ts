import { pgTable, index, uniqueIndex, foreignKey, uuid, text, boolean, timestamp, integer, numeric, date, check, jsonb, unique, serial, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const activityAction = pgEnum("activity_action", ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'VOID', 'RETURN', 'PAY', 'PRINT', 'EXPORT'])
export const bloodGroup = pgEnum("blood_group", ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
export const cashAccountType = pgEnum("cash_account_type", ['CASH', 'BANK', 'MPESA', 'MOBILE_MONEY', 'PETTY_CASH'])
export const consultationStatus = pgEnum("consultation_status", ['OPEN', 'COMPLETED', 'REFERRED', 'CANCELLED'])
export const customerType = pgEnum("customer_type", ['INDIVIDUAL', 'BUSINESS'])
export const diagnosisType = pgEnum("diagnosis_type", ['PRIMARY', 'SECONDARY', 'PROVISIONAL', 'DIFFERENTIAL'])
export const dispensationStatus = pgEnum("dispensation_status", ['PENDING', 'PARTIALLY_DISPENSED', 'DISPENSED', 'CANCELLED'])
export const dispensingLevel = pgEnum("dispensing_level", ['OTC', 'PRESCRIPTION', 'CONTROLLED', 'NARCOTIC'])
export const documentType = pgEnum("document_type", ['SALE', 'PURCHASE_ORDER', 'GOODS_RECEIPT', 'SUPPLIER_RETURN', 'SALE_RETURN', 'PAYMENT', 'EXPENSE', 'INCOME', 'JOURNAL', 'STOCK_TRANSFER', 'STOCK_ADJUSTMENT'])
export const entityType = pgEnum("entity_type", ['BUSINESS', 'USER', 'ROLE', 'PRODUCT', 'CATEGORY', 'SUPPLIER', 'PURCHASE_ORDER', 'GOODS_RECEIPT', 'SALE', 'PAYMENT', 'CUSTOMER', 'PRESCRIPTION', 'EXPENSE', 'SETTING'])
export const expenseStatus = pgEnum("expense_status", ['PENDING', 'APPROVED', 'PAID', 'CANCELLED'])
export const gender = pgEnum("gender", ['MALE', 'FEMALE', 'OTHER'])
export const goodsReceiptStatus = pgEnum("goods_receipt_status", ['DRAFT', 'POSTED', 'CANCELLED'])
export const insuranceClaimStatus = pgEnum("insurance_claim_status", ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PAID', 'CANCELLED'])
export const journalSourceType = pgEnum("journal_source_type", ['SALE', 'PURCHASE', 'EXPENSE', 'INCOME', 'PAYMENT', 'RECEIPT', 'PURCHASE_RETURN', 'SALES_RETURN', 'STOCK_ADJUSTMENT', 'STOCK_TRANSFER', 'OPENING_BALANCE', 'MANUAL_JOURNAL'])
export const journalStatus = pgEnum("journal_status", ['DRAFT', 'POSTED', 'REVERSED', 'VOIDED'])
export const normalBalance = pgEnum("normal_balance", ['DEBIT', 'CREDIT'])
export const paymentMethod = pgEnum("payment_method", ['CASH', 'MPESA', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT', 'MOBILE_MONEY', 'GIFT_VOUCHER'])
export const paymentStatus = pgEnum("payment_status", ['PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REVERSED', 'REFUNDED'])
export const prescriptionStatus = pgEnum("prescription_status", ['PENDING', 'PARTIALLY_DISPENSED', 'DISPENSED', 'CANCELLED', 'EXPIRED'])
export const purchaseOrderStatus = pgEnum("purchase_order_status", ['DRAFT', 'PENDING', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'])
export const returnReason = pgEnum("return_reason", ['DAMAGED', 'EXPIRED', 'WRONG_ITEM', 'RECALL', 'OVER_SUPPLIED', 'OTHER'])
export const saleReturnReason = pgEnum("sale_return_reason", ['DAMAGED', 'DEFECTIVE', 'EXPIRED', 'WRONG_ITEM', 'CUSTOMER_CHANGED_MIND', 'PRICE_ADJUSTMENT', 'OTHER'])
export const saleStatus = pgEnum("sale_status", ['DRAFT', 'COMPLETED', 'PARTIALLY_PAID', 'CREDIT', 'VOIDED', 'REFUNDED'])
export const stockMovementType = pgEnum("stock_movement_type", ['OPENING_STOCK', 'PURCHASE', 'SALE', 'SALE_RETURN', 'PURCHASE_RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'DAMAGED', 'EXPIRED'])
export const transactionStatus = pgEnum("transaction_status", ['DRAFT', 'PENDING', 'APPROVED', 'COMPLETED', 'VOIDED', 'CANCELLED'])
export const userRole = pgEnum("user_role", ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'PHARMACIST', 'CASHIER', 'STORE_KEEPER'])


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	roleId: uuid("role_id").notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	passwordHash: text("password_hash").notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
}, (table) => [
	index("users_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("users_business_email_unique").using("btree", table.businessId.asc().nullsLast().op("uuid_ops"), table.email.asc().nullsLast().op("text_ops")),
	index("users_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("users_role_idx").using("btree", table.roleId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "users_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "users_role_id_roles_id_fk"
		}),
]);

export const permissions = pgTable("permissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	name: text().notNull(),
	module: text().notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	isSystem: boolean("is_system").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("permissions_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("permissions_code_unique").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("permissions_module_idx").using("btree", table.module.asc().nullsLast().op("text_ops")),
	uniqueIndex("permissions_name_unique").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const roles = pgTable("roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	name: text().notNull(),
	description: text(),
	isSystem: boolean("is_system").default(false).notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("roles_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	index("roles_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("roles_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	index("roles_system_idx").using("btree", table.isSystem.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "roles_business_id_businesses_id_fk"
		}),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	name: text().notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("categories_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("categories_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	index("categories_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "categories_business_id_businesses_id_fk"
		}),
]);

export const businesses = pgTable("businesses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	legalName: text("legal_name"),
	registrationNumber: text("registration_number"),
	kraPin: text("kra_pin"),
	businessType: text("business_type").notNull(),
	email: text(),
	phone: text(),
	website: text(),
	country: text().default('Kenya').notNull(),
	county: text(),
	town: text(),
	address: text(),
	currency: text().default('KES').notNull(),
	timezone: text().default('Africa/Nairobi').notNull(),
	logo: text(),
	active: boolean().default(true).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("businesses_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("businesses_kra_pin_unique").using("btree", table.kraPin.asc().nullsLast().op("text_ops")),
	uniqueIndex("businesses_registration_number_unique").using("btree", table.registrationNumber.asc().nullsLast().op("text_ops")),
	index("businesses_type_idx").using("btree", table.businessType.asc().nullsLast().op("text_ops")),
]);

export const suppliers = pgTable("suppliers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	name: text().notNull(),
	contactPerson: text("contact_person"),
	email: text(),
	phone: text(),
	kraPin: text("kra_pin"),
	address: text(),
	town: text(),
	notes: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("suppliers_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("suppliers_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	index("suppliers_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "suppliers_business_id_businesses_id_fk"
		}),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	categoryId: uuid("category_id").notNull(),
	supplierId: uuid("supplier_id"),
	name: text().notNull(),
	genericName: text("generic_name"),
	productBrand: text("product_brand"),
	description: text(),
	sku: text(),
	barcode: text(),
	packSize: text("pack_size"),
	trackInventory: boolean("track_inventory").default(true).notNull(),
	trackBatch: boolean("track_batch").default(false).notNull(),
	trackExpiry: boolean("track_expiry").default(false).notNull(),
	minimumStock: integer("minimum_stock").default(0).notNull(),
	reorderLevel: integer("reorder_level").default(0).notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	manufacturerId: uuid("manufacturer_id"),
	drugCategoryId: uuid("drug_category_id"),
	dosageFormId: uuid("dosage_form_id"),
	drugStrengthId: uuid("drug_strength_id"),
	prescriptionTypeId: uuid("prescription_type_id"),
	purchaseUnitId: uuid("purchase_unit_id"),
	salesUnitId: uuid("sales_unit_id"),
	stockUnitId: uuid("stock_unit_id"),
	incomeAccountId: uuid("income_account_id"),
	expenseAccountId: uuid("expense_account_id"),
	inventoryAccountId: uuid("inventory_account_id"),
	taxRateId: uuid("tax_rate_id"),
	costPrice: numeric("cost_price", { precision: 12, scale:  2 }),
	serialized: boolean().default(false).notNull(),
	allowNegativeStock: boolean("allow_negative_stock").default(false).notNull(),
}, (table) => [
	uniqueIndex("products_business_barcode_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.barcode.asc().nullsLast().op("text_ops")),
	index("products_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("products_business_name_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("products_business_sku_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.sku.asc().nullsLast().op("text_ops")),
	index("products_category_idx").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("products_drug_category_idx").using("btree", table.drugCategoryId.asc().nullsLast().op("uuid_ops")),
	index("products_manufacturer_idx").using("btree", table.manufacturerId.asc().nullsLast().op("uuid_ops")),
	index("products_supplier_idx").using("btree", table.supplierId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "products_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_category_id_categories_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "products_supplier_id_suppliers_id_fk"
		}),
	foreignKey({
			columns: [table.manufacturerId],
			foreignColumns: [manufacturers.id],
			name: "products_manufacturer_id_manufacturers_id_fk"
		}),
	foreignKey({
			columns: [table.drugCategoryId],
			foreignColumns: [drugCategories.id],
			name: "products_drug_category_id_drug_categories_id_fk"
		}),
	foreignKey({
			columns: [table.dosageFormId],
			foreignColumns: [dosageForms.id],
			name: "products_dosage_form_id_dosage_forms_id_fk"
		}),
	foreignKey({
			columns: [table.drugStrengthId],
			foreignColumns: [drugStrengths.id],
			name: "products_drug_strength_id_drug_strengths_id_fk"
		}),
	foreignKey({
			columns: [table.prescriptionTypeId],
			foreignColumns: [prescriptionTypes.id],
			name: "products_prescription_type_id_prescription_types_id_fk"
		}),
	foreignKey({
			columns: [table.purchaseUnitId],
			foreignColumns: [units.id],
			name: "products_purchase_unit_id_units_id_fk"
		}),
	foreignKey({
			columns: [table.salesUnitId],
			foreignColumns: [units.id],
			name: "products_sales_unit_id_units_id_fk"
		}),
	foreignKey({
			columns: [table.stockUnitId],
			foreignColumns: [units.id],
			name: "products_stock_unit_id_units_id_fk"
		}),
	foreignKey({
			columns: [table.incomeAccountId],
			foreignColumns: [chartOfAccounts.id],
			name: "products_income_account_id_chart_of_accounts_id_fk"
		}),
	foreignKey({
			columns: [table.expenseAccountId],
			foreignColumns: [chartOfAccounts.id],
			name: "products_expense_account_id_chart_of_accounts_id_fk"
		}),
	foreignKey({
			columns: [table.inventoryAccountId],
			foreignColumns: [chartOfAccounts.id],
			name: "products_inventory_account_id_chart_of_accounts_id_fk"
		}),
	foreignKey({
			columns: [table.taxRateId],
			foreignColumns: [taxRates.id],
			name: "products_tax_rate_id_tax_rates_id_fk"
		}),
]);

export const productBatches = pgTable("product_batches", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	productId: uuid("product_id").notNull(),
	supplierId: uuid("supplier_id"),
	batchNumber: text("batch_number").notNull(),
	manufactureDate: date("manufacture_date"),
	expiryDate: date("expiry_date"),
	purchaseInvoice: text("purchase_invoice"),
	costPrice: numeric("cost_price", { precision: 12, scale:  2 }).notNull(),
	sellingPrice: numeric("selling_price", { precision: 12, scale:  2 }),
	quantityReceived: integer("quantity_received").notNull(),
	quantityRemaining: integer("quantity_remaining").notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("batch_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("batch_expiry_idx").using("btree", table.expiryDate.asc().nullsLast().op("date_ops")),
	index("batch_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	index("batch_supplier_idx").using("btree", table.supplierId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("product_batch_unique").using("btree", table.businessId.asc().nullsLast().op("uuid_ops"), table.productId.asc().nullsLast().op("text_ops"), table.batchNumber.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "product_batches_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_batches_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "product_batches_supplier_id_suppliers_id_fk"
		}),
]);

export const purchaseOrders = pgTable("purchase_orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	supplierId: uuid("supplier_id").notNull(),
	orderNumber: text("order_number").notNull(),
	status: purchaseOrderStatus().default('DRAFT').notNull(),
	subtotal: numeric({ precision: 12, scale:  2 }).default('0'),
	discount: numeric({ precision: 12, scale:  2 }).default('0'),
	tax: numeric({ precision: 12, scale:  2 }).default('0'),
	total: numeric({ precision: 12, scale:  2 }).default('0'),
	notes: text(),
	orderedBy: uuid("ordered_by"),
	approvedBy: uuid("approved_by"),
	orderedAt: timestamp("ordered_at", { mode: 'string' }).defaultNow().notNull(),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("po_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("po_order_idx").using("btree", table.orderNumber.asc().nullsLast().op("text_ops")),
	index("po_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("po_supplier_idx").using("btree", table.supplierId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "purchase_orders_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "purchase_orders_supplier_id_suppliers_id_fk"
		}),
	foreignKey({
			columns: [table.orderedBy],
			foreignColumns: [users.id],
			name: "purchase_orders_ordered_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "purchase_orders_approved_by_users_id_fk"
		}),
]);

export const purchaseOrderItems = pgTable("purchase_order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	purchaseOrderId: uuid("purchase_order_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().notNull(),
	receivedQuantity: integer("received_quantity").default(0).notNull(),
	unitCost: numeric("unit_cost", { precision: 12, scale:  2 }).notNull(),
	discount: numeric({ precision: 12, scale:  2 }).default('0'),
	tax: numeric({ precision: 12, scale:  2 }).default('0'),
	total: numeric({ precision: 12, scale:  2 }).notNull(),
}, (table) => [
	index("poi_order_idx").using("btree", table.purchaseOrderId.asc().nullsLast().op("uuid_ops")),
	index("poi_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.purchaseOrderId],
			foreignColumns: [purchaseOrders.id],
			name: "purchase_order_items_purchase_order_id_purchase_orders_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "purchase_order_items_product_id_products_id_fk"
		}),
]);

export const stockMovements = pgTable("stock_movements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	productId: uuid("product_id").notNull(),
	batchId: uuid("batch_id"),
	userId: uuid("user_id"),
	movementType: stockMovementType("movement_type").notNull(),
	quantity: integer().notNull(),
	unitCost: numeric("unit_cost", { precision: 12, scale:  2 }),
	reference: text(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	warehouseId: uuid("warehouse_id").notNull(),
}, (table) => [
	index("stock_batch_idx").using("btree", table.batchId.asc().nullsLast().op("uuid_ops")),
	index("stock_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("stock_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("stock_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	index("stock_type_idx").using("btree", table.movementType.asc().nullsLast().op("enum_ops")),
	index("stock_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "stock_movements_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "stock_movements_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.batchId],
			foreignColumns: [productBatches.id],
			name: "stock_movements_batch_id_product_batches_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "stock_movements_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.warehouseId],
			foreignColumns: [warehouses.id],
			name: "stock_movements_warehouse_id_warehouses_id_fk"
		}),
]);

export const saleItems = pgTable("sale_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	saleId: uuid("sale_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().notNull(),
	unitPrice: numeric("unit_price", { precision: 12, scale:  2 }).notNull(),
	discount: numeric({ precision: 12, scale:  2 }).default('0'),
	tax: numeric({ precision: 12, scale:  2 }).default('0'),
	total: numeric({ precision: 12, scale:  2 }).notNull(),
	businessId: uuid("business_id").notNull(),
}, (table) => [
	index("sale_items_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("sale_items_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	index("sale_items_sale_idx").using("btree", table.saleId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "sale_items_business_id_businesses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.saleId],
			foreignColumns: [sales.id],
			name: "sale_items_sale_id_sales_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "sale_items_product_id_products_id_fk"
		}).onDelete("restrict"),
	check("sale_items_quantity_positive", sql`quantity > 0`),
]);

export const loginHistory = pgTable("login_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	userId: uuid("user_id"),
	loginTime: timestamp("login_time", { mode: 'string' }).defaultNow().notNull(),
	logoutTime: timestamp("logout_time", { mode: 'string' }),
	successful: boolean().default(true).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
}, (table) => [
	index("login_history_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("login_history_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "login_history_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "login_history_user_id_users_id_fk"
		}),
]);

export const saleItemBatches = pgTable("sale_item_batches", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	saleItemId: uuid("sale_item_id").notNull(),
	productBatchId: uuid("product_batch_id").notNull(),
	quantity: integer().notNull(),
}, (table) => [
	uniqueIndex("sale_item_batch_unique").using("btree", table.saleItemId.asc().nullsLast().op("uuid_ops"), table.productBatchId.asc().nullsLast().op("uuid_ops")),
	index("sale_item_batches_batch_idx").using("btree", table.productBatchId.asc().nullsLast().op("uuid_ops")),
	index("sale_item_batches_sale_item_idx").using("btree", table.saleItemId.asc().nullsLast().op("uuid_ops")),
	index("sib_batch_idx").using("btree", table.productBatchId.asc().nullsLast().op("uuid_ops")),
	index("sib_sale_item_idx").using("btree", table.saleItemId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.saleItemId],
			foreignColumns: [saleItems.id],
			name: "sale_item_batches_sale_item_id_sale_items_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productBatchId],
			foreignColumns: [productBatches.id],
			name: "sale_item_batches_product_batch_id_product_batches_id_fk"
		}).onDelete("restrict"),
	check("sale_item_batch_quantity_positive", sql`quantity > 0`),
]);

export const saleReturnItems = pgTable("sale_return_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	saleReturnId: uuid("sale_return_id").notNull(),
	saleItemId: uuid("sale_item_id").notNull(),
	productBatchId: uuid("product_batch_id"),
	quantity: integer().notNull(),
	unitPrice: numeric("unit_price", { precision: 12, scale:  2 }).notNull(),
	total: numeric({ precision: 12, scale:  2 }).notNull(),
}, (table) => [
	uniqueIndex("sale_return_item_batch_unique").using("btree", table.saleReturnId.asc().nullsLast().op("uuid_ops"), table.saleItemId.asc().nullsLast().op("uuid_ops"), table.productBatchId.asc().nullsLast().op("uuid_ops")),
	index("sale_return_items_batch_idx").using("btree", table.productBatchId.asc().nullsLast().op("uuid_ops")),
	index("sale_return_items_return_idx").using("btree", table.saleReturnId.asc().nullsLast().op("uuid_ops")),
	index("sale_return_items_sale_item_idx").using("btree", table.saleItemId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.saleReturnId],
			foreignColumns: [saleReturns.id],
			name: "sale_return_items_sale_return_id_sale_returns_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.saleItemId],
			foreignColumns: [saleItems.id],
			name: "sale_return_items_sale_item_id_sale_items_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.productBatchId],
			foreignColumns: [productBatches.id],
			name: "sale_return_items_product_batch_id_product_batches_id_fk"
		}).onDelete("restrict"),
	check("sale_return_items_quantity_positive", sql`quantity > 0`),
]);

export const saleReturns = pgTable("sale_returns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	saleId: uuid("sale_id").notNull(),
	customerId: uuid("customer_id"),
	returnNumber: text("return_number").notNull(),
	reason: saleReturnReason().default('OTHER').notNull(),
	subtotal: numeric({ precision: 12, scale:  2 }).default('0'),
	tax: numeric({ precision: 12, scale:  2 }).default('0'),
	total: numeric({ precision: 12, scale:  2 }).default('0'),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	approvedBy: uuid("approved_by"),
}, (table) => [
	index("sale_returns_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("sale_returns_business_return_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.returnNumber.asc().nullsLast().op("uuid_ops")),
	index("sale_returns_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("sale_returns_customer_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	index("sale_returns_number_idx").using("btree", table.returnNumber.asc().nullsLast().op("text_ops")),
	index("sale_returns_reason_idx").using("btree", table.reason.asc().nullsLast().op("enum_ops")),
	index("sale_returns_sale_idx").using("btree", table.saleId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "sale_returns_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "sale_returns_approved_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "sale_returns_business_id_businesses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.saleId],
			foreignColumns: [sales.id],
			name: "sale_returns_sale_id_sales_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "sale_returns_customer_id_customers_id_fk"
		}).onDelete("set null"),
]);

export const activityLogs = pgTable("activity_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	userId: uuid("user_id"),
	action: activityAction().notNull(),
	entity: entityType().notNull(),
	entityId: uuid("entity_id"),
	description: text(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("activity_logs_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("activity_logs_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("activity_logs_entity_idx").using("btree", table.entity.asc().nullsLast().op("enum_ops")),
	index("activity_logs_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "activity_logs_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "activity_logs_user_id_users_id_fk"
		}),
]);

export const supplierReturns = pgTable("supplier_returns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	supplierId: uuid("supplier_id").notNull(),
	returnNumber: text("return_number").notNull(),
	reason: returnReason().default('OTHER').notNull(),
	subtotal: numeric({ precision: 12, scale:  2 }).default('0'),
	tax: numeric({ precision: 12, scale:  2 }).default('0'),
	total: numeric({ precision: 12, scale:  2 }).default('0'),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("supplier_return_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("supplier_return_number_idx").using("btree", table.returnNumber.asc().nullsLast().op("text_ops")),
	index("supplier_return_supplier_idx").using("btree", table.supplierId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "supplier_returns_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "supplier_returns_supplier_id_suppliers_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "supplier_returns_created_by_users_id_fk"
		}),
]);

export const goodsReceiptItems = pgTable("goods_receipt_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	goodsReceiptId: uuid("goods_receipt_id").notNull(),
	productId: uuid("product_id").notNull(),
	batchNumber: text("batch_number"),
	expiryDate: date("expiry_date"),
	quantity: integer().notNull(),
	unitCost: numeric("unit_cost", { precision: 12, scale:  2 }).notNull(),
	total: numeric({ precision: 12, scale:  2 }).notNull(),
}, (table) => [
	index("gri_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	index("gri_receipt_idx").using("btree", table.goodsReceiptId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.goodsReceiptId],
			foreignColumns: [goodsReceipts.id],
			name: "goods_receipt_items_goods_receipt_id_goods_receipts_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "goods_receipt_items_product_id_products_id_fk"
		}),
]);

export const customers = pgTable("customers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	customerNumber: text("customer_number"),
	firstName: text("first_name").notNull(),
	lastName: text("last_name"),
	phone: text(),
	email: text(),
	idNumber: text("id_number"),
	address: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	customerType: customerType("customer_type").default('INDIVIDUAL').notNull(),
	companyName: text("company_name"),
	taxPin: text("tax_pin"),
	openingBalance: numeric("opening_balance", { precision: 12, scale:  2 }).default('0').notNull(),
	creditLimit: numeric("credit_limit", { precision: 12, scale:  2 }).default('0').notNull(),
	dateOfBirth: date("date_of_birth"),
	gender: gender(),
	bloodGroup: bloodGroup("blood_group"),
	allergies: text(),
	emergencyContact: text("emergency_contact"),
	emergencyPhone: text("emergency_phone"),
	primaryPhysician: text("primary_physician"),
}, (table) => [
	index("customers_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("customers_business_customer_number_unique").using("btree", table.businessId.asc().nullsLast().op("uuid_ops"), table.customerNumber.asc().nullsLast().op("uuid_ops")),
	index("customers_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("customers_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("customers_id_number_idx").using("btree", table.idNumber.asc().nullsLast().op("text_ops")),
	index("customers_phone_idx").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("customers_type_idx").using("btree", table.customerType.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "customers_business_id_businesses_id_fk"
		}).onDelete("cascade"),
]);

export const goodsReceipts = pgTable("goods_receipts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	purchaseOrderId: uuid("purchase_order_id"),
	supplierId: uuid("supplier_id").notNull(),
	receiptNumber: text("receipt_number").notNull(),
	supplierInvoiceNumber: text("supplier_invoice_number"),
	status: goodsReceiptStatus().default('DRAFT').notNull(),
	subtotal: numeric({ precision: 12, scale:  2 }).default('0'),
	tax: numeric({ precision: 12, scale:  2 }).default('0'),
	total: numeric({ precision: 12, scale:  2 }).default('0'),
	receivedBy: uuid("received_by"),
	notes: text(),
	receivedAt: timestamp("received_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("grn_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("grn_number_idx").using("btree", table.receiptNumber.asc().nullsLast().op("text_ops")),
	index("grn_po_idx").using("btree", table.purchaseOrderId.asc().nullsLast().op("uuid_ops")),
	index("grn_supplier_idx").using("btree", table.supplierId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "goods_receipts_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.purchaseOrderId],
			foreignColumns: [purchaseOrders.id],
			name: "goods_receipts_purchase_order_id_purchase_orders_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "goods_receipts_supplier_id_suppliers_id_fk"
		}),
	foreignKey({
			columns: [table.receivedBy],
			foreignColumns: [users.id],
			name: "goods_receipts_received_by_users_id_fk"
		}),
]);

export const apiKeys = pgTable("api_keys", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	name: text().notNull(),
	keyHash: text("key_hash").notNull(),
	active: boolean().default(true).notNull(),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("api_keys_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	index("api_keys_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("api_keys_hash_unique").using("btree", table.keyHash.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "api_keys_business_id_businesses_id_fk"
		}),
]);

export const cashAccounts = pgTable("cash_accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	name: text().notNull(),
	type: cashAccountType().notNull(),
	accountNumber: text("account_number"),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	accountId: uuid("account_id").notNull(),
	bankName: text("bank_name"),
	branchName: text("branch_name"),
	currency: text().default('KES').notNull(),
	openingBalance: numeric("opening_balance", { precision: 18, scale:  2 }).default('0').notNull(),
	details: jsonb(),
}, (table) => [
	index("cash_accounts_account_idx").using("btree", table.accountId.asc().nullsLast().op("uuid_ops")),
	index("cash_accounts_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	index("cash_accounts_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("cash_accounts_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	index("cash_accounts_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "cash_accounts_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [chartOfAccounts.id],
			name: "cash_accounts_account_id_chart_of_accounts_id_fk"
		}),
]);

export const diagnoses = pgTable("diagnoses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	code: text().notNull(),
	name: text().notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("diagnoses_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("diagnoses_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("diagnoses_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("diagnoses_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "diagnoses_business_id_businesses_id_fk"
		}),
]);

export const accountCategories = pgTable("account_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	accountTypeId: uuid("account_type_id").notNull(),
	code: text().notNull(),
	name: text().notNull(),
	description: text(),
	displayOrder: integer("display_order").default(0).notNull(),
	isSystem: boolean("is_system").default(true).notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("account_categories_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("account_categories_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("uuid_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("account_categories_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("account_categories_display_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	index("account_categories_type_idx").using("btree", table.accountTypeId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "account_categories_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.accountTypeId],
			foreignColumns: [accountTypes.id],
			name: "account_categories_account_type_id_account_types_id_fk"
		}),
]);

export const accountTypes = pgTable("account_types", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	code: text().notNull(),
	name: text().notNull(),
	description: text(),
	normalBalance: normalBalance("normal_balance").notNull(),
	displayOrder: integer("display_order").default(0).notNull(),
	isSystem: boolean("is_system").default(true).notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("account_types_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("account_types_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("account_types_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("account_types_display_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "account_types_business_id_businesses_id_fk"
		}),
]);

export const chartOfAccounts = pgTable("chart_of_accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	accountCategoryId: uuid("account_category_id").notNull(),
	parentAccountId: uuid("parent_account_id"),
	accountCode: text("account_code").notNull(),
	accountName: text("account_name").notNull(),
	description: text(),
	level: integer().default(1).notNull(),
	displayOrder: integer("display_order").default(0).notNull(),
	isSystem: boolean("is_system").default(false).notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("coa_account_category_idx").using("btree", table.accountCategoryId.asc().nullsLast().op("uuid_ops")),
	index("coa_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("coa_business_account_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.accountCode.asc().nullsLast().op("uuid_ops")),
	index("coa_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("coa_display_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	index("coa_parent_idx").using("btree", table.parentAccountId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "chart_of_accounts_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.accountCategoryId],
			foreignColumns: [accountCategories.id],
			name: "chart_of_accounts_account_category_id_account_categories_id_fk"
		}),
	foreignKey({
			columns: [table.parentAccountId],
			foreignColumns: [table.id],
			name: "coa_parent_account_fk"
		}),
]);

export const expenseCategories = pgTable("expense_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	name: text().notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("expense_categories_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	index("expense_categories_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("expense_categories_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "expense_categories_business_id_businesses_id_fk"
		}),
]);

export const expenses = pgTable("expenses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	categoryId: uuid("category_id").notNull(),
	cashAccountId: uuid("cash_account_id"),
	description: text().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	reference: text(),
	status: expenseStatus().default('PAID').notNull(),
	paidTo: text("paid_to"),
	createdBy: uuid("created_by"),
	expenseDate: timestamp("expense_date", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("expenses_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("expenses_cash_account_idx").using("btree", table.cashAccountId.asc().nullsLast().op("uuid_ops")),
	index("expenses_category_idx").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("expenses_date_idx").using("btree", table.expenseDate.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "expenses_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [expenseCategories.id],
			name: "expenses_category_id_expense_categories_id_fk"
		}),
	foreignKey({
			columns: [table.cashAccountId],
			foreignColumns: [cashAccounts.id],
			name: "expenses_cash_account_id_cash_accounts_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "expenses_created_by_users_id_fk"
		}),
]);

export const incomeCategories = pgTable("income_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	name: text().notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("income_categories_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	index("income_categories_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("income_categories_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "income_categories_business_id_businesses_id_fk"
		}),
]);

export const consultations = pgTable("consultations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	branchId: uuid("branch_id").notNull(),
	customerId: uuid("customer_id").notNull(),
	consultationNumber: text("consultation_number").notNull(),
	clinicianId: uuid("clinician_id").notNull(),
	visitReason: text("visit_reason"),
	historyOfPresentIllness: text("history_of_present_illness"),
	examinationNotes: text("examination_notes"),
	clinicalNotes: text("clinical_notes"),
	status: consultationStatus().default('OPEN').notNull(),
	consultationDate: timestamp("consultation_date", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("consultations_branch_idx").using("btree", table.branchId.asc().nullsLast().op("uuid_ops")),
	index("consultations_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("consultations_business_number_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.consultationNumber.asc().nullsLast().op("text_ops")),
	index("consultations_clinician_idx").using("btree", table.clinicianId.asc().nullsLast().op("uuid_ops")),
	index("consultations_customer_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	index("consultations_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "consultations_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.branchId],
			foreignColumns: [branches.id],
			name: "consultations_branch_id_branches_id_fk"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "consultations_customer_id_customers_id_fk"
		}),
	foreignKey({
			columns: [table.clinicianId],
			foreignColumns: [users.id],
			name: "consultations_clinician_id_users_id_fk"
		}),
]);

export const consultationDiagnoses = pgTable("consultation_diagnoses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	consultationId: uuid("consultation_id").notNull(),
	diagnosisId: uuid("diagnosis_id").notNull(),
	diagnosisType: diagnosisType("diagnosis_type").default('PRIMARY').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("consultation_diagnoses_consultation_idx").using("btree", table.consultationId.asc().nullsLast().op("uuid_ops")),
	index("consultation_diagnoses_diagnosis_idx").using("btree", table.diagnosisId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("consultation_diagnoses_unique").using("btree", table.consultationId.asc().nullsLast().op("uuid_ops"), table.diagnosisId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.consultationId],
			foreignColumns: [consultations.id],
			name: "consultation_diagnoses_consultation_id_consultations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.diagnosisId],
			foreignColumns: [diagnoses.id],
			name: "consultation_diagnoses_diagnosis_id_diagnoses_id_fk"
		}),
]);

export const taxRates = pgTable("tax_rates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	code: text().notNull(),
	name: text().notNull(),
	rate: numeric({ precision: 5, scale:  2 }).notNull(),
	description: text(),
	isDefault: boolean("is_default").default(false).notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("tax_rates_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("tax_rates_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("tax_rates_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "tax_rates_business_id_businesses_id_fk"
		}),
]);

export const productPrices = pgTable("product_prices", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	productId: uuid("product_id").notNull(),
	priceListId: uuid("price_list_id").notNull(),
	price: numeric({ precision: 12, scale:  2 }).notNull(),
	minimumQuantity: numeric("minimum_quantity", { precision: 12, scale:  2 }).default('1').notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("product_prices_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("product_prices_price_list_idx").using("btree", table.priceListId.asc().nullsLast().op("uuid_ops")),
	index("product_prices_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("product_prices_product_price_list_qty_unique").using("btree", table.productId.asc().nullsLast().op("uuid_ops"), table.priceListId.asc().nullsLast().op("numeric_ops"), table.minimumQuantity.asc().nullsLast().op("numeric_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "product_prices_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_prices_product_id_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.priceListId],
			foreignColumns: [priceLists.id],
			name: "product_prices_price_list_id_price_lists_id_fk"
		}),
]);

export const drugCategories = pgTable("drug_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	code: text().notNull(),
	name: text().notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("drug_categories_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("drug_categories_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("drug_categories_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("drug_categories_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "drug_categories_business_id_businesses_id_fk"
		}),
]);

export const drugStrengths = pgTable("drug_strengths", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	code: text().notNull(),
	name: text().notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("drug_strengths_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("drug_strengths_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("drug_strengths_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("drug_strengths_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "drug_strengths_business_id_businesses_id_fk"
		}),
]);

export const dosageForms = pgTable("dosage_forms", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	code: text().notNull(),
	name: text().notNull(),
	standardCode: text("standard_code"),
	description: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("dosage_forms_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("dosage_forms_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("dosage_forms_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("dosage_forms_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "dosage_forms_business_id_businesses_id_fk"
		}),
]);

export const manufacturers = pgTable("manufacturers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	name: text().notNull(),
	country: text(),
	email: text(),
	phone: text(),
	website: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("manufacturers_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	index("manufacturers_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("manufacturers_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "manufacturers_business_id_businesses_id_fk"
		}),
]);

export const prescriptionTypes = pgTable("prescription_types", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	code: text().notNull(),
	name: text().notNull(),
	description: text(),
	dispensingLevel: dispensingLevel("dispensing_level").notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("prescription_types_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("prescription_types_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("prescription_types_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("prescription_types_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "prescription_types_business_id_businesses_id_fk"
		}),
]);

export const prescriptions = pgTable("prescriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	customerId: uuid("customer_id").notNull(),
	consultationId: uuid("consultation_id"),
	prescriptionNumber: text("prescription_number").notNull(),
	doctorName: text("doctor_name").notNull(),
	doctorLicense: text("doctor_license"),
	hospitalName: text("hospital_name"),
	prescriptionDate: date("prescription_date").notNull(),
	expiryDate: date("expiry_date"),
	status: prescriptionStatus().default('PENDING').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("prescriptions_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("prescriptions_business_number_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.prescriptionNumber.asc().nullsLast().op("uuid_ops")),
	index("prescriptions_customer_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	index("prescriptions_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "prescriptions_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "prescriptions_customer_id_customers_id_fk"
		}),
	foreignKey({
			columns: [table.consultationId],
			foreignColumns: [consultations.id],
			name: "prescriptions_consultation_id_consultations_id_fk"
		}),
]);

export const incomes = pgTable("incomes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	categoryId: uuid("category_id").notNull(),
	cashAccountId: uuid("cash_account_id"),
	description: text().notNull(),
	amount: numeric({ precision: 18, scale:  2 }).notNull(),
	reference: text(),
	receivedFrom: text("received_from"),
	receivedBy: uuid("received_by"),
	status: transactionStatus().default('COMPLETED').notNull(),
	incomeDate: timestamp("income_date", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("incomes_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("incomes_cash_account_idx").using("btree", table.cashAccountId.asc().nullsLast().op("uuid_ops")),
	index("incomes_category_idx").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("incomes_date_idx").using("btree", table.incomeDate.asc().nullsLast().op("timestamp_ops")),
	index("incomes_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "incomes_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [incomeCategories.id],
			name: "incomes_category_id_income_categories_id_fk"
		}),
	foreignKey({
			columns: [table.cashAccountId],
			foreignColumns: [cashAccounts.id],
			name: "incomes_cash_account_id_cash_accounts_id_fk"
		}),
	foreignKey({
			columns: [table.receivedBy],
			foreignColumns: [users.id],
			name: "incomes_received_by_users_id_fk"
		}),
]);

export const journalEntries = pgTable("journal_entries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	journalNumber: text("journal_number").notNull(),
	transactionDate: timestamp("transaction_date", { mode: 'string' }).defaultNow().notNull(),
	description: text().notNull(),
	reference: text(),
	externalReference: text("external_reference"),
	sourceType: journalSourceType("source_type").notNull(),
	sourceId: uuid("source_id").notNull(),
	postedBy: uuid("posted_by"),
	status: journalStatus().default('POSTED').notNull(),
	isSystemGenerated: boolean("is_system_generated").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("journal_entries_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("journal_entries_date_idx").using("btree", table.transactionDate.asc().nullsLast().op("timestamp_ops")),
	index("journal_entries_number_idx").using("btree", table.journalNumber.asc().nullsLast().op("text_ops")),
	index("journal_entries_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "journal_entries_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.postedBy],
			foreignColumns: [users.id],
			name: "journal_entries_posted_by_users_id_fk"
		}),
]);

export const priceLists = pgTable("price_lists", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	code: text().notNull(),
	name: text().notNull(),
	description: text(),
	isDefault: boolean("is_default").default(false).notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("price_lists_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("price_lists_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("price_lists_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("price_lists_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "price_lists_business_id_businesses_id_fk"
		}),
]);

export const dispensations = pgTable("dispensations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	branchId: uuid("branch_id").notNull(),
	warehouseId: uuid("warehouse_id").notNull(),
	prescriptionId: uuid("prescription_id").notNull(),
	saleId: uuid("sale_id"),
	dispensationNumber: text("dispensation_number").notNull(),
	dispensedBy: uuid("dispensed_by"),
	checkedBy: uuid("checked_by"),
	status: dispensationStatus().default('PENDING').notNull(),
	notes: text(),
	dispensedAt: timestamp("dispensed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("dispensations_branch_idx").using("btree", table.branchId.asc().nullsLast().op("uuid_ops")),
	index("dispensations_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("dispensations_business_number_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.dispensationNumber.asc().nullsLast().op("uuid_ops")),
	index("dispensations_prescription_idx").using("btree", table.prescriptionId.asc().nullsLast().op("uuid_ops")),
	index("dispensations_sale_idx").using("btree", table.saleId.asc().nullsLast().op("uuid_ops")),
	index("dispensations_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("dispensations_warehouse_idx").using("btree", table.warehouseId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "dispensations_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.branchId],
			foreignColumns: [branches.id],
			name: "dispensations_branch_id_branches_id_fk"
		}),
	foreignKey({
			columns: [table.warehouseId],
			foreignColumns: [warehouses.id],
			name: "dispensations_warehouse_id_warehouses_id_fk"
		}),
	foreignKey({
			columns: [table.prescriptionId],
			foreignColumns: [prescriptions.id],
			name: "dispensations_prescription_id_prescriptions_id_fk"
		}),
	foreignKey({
			columns: [table.saleId],
			foreignColumns: [sales.id],
			name: "dispensations_sale_id_sales_id_fk"
		}),
	foreignKey({
			columns: [table.dispensedBy],
			foreignColumns: [users.id],
			name: "dispensations_dispensed_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.checkedBy],
			foreignColumns: [users.id],
			name: "dispensations_checked_by_users_id_fk"
		}),
]);

export const warehouses = pgTable("warehouses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	branchId: uuid("branch_id").notNull(),
	code: text().notNull(),
	name: text().notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("warehouses_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("warehouses_branch_code_unique").using("btree", table.branchId.asc().nullsLast().op("uuid_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("warehouses_branch_idx").using("btree", table.branchId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("warehouses_branch_name_unique").using("btree", table.branchId.asc().nullsLast().op("uuid_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	index("warehouses_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "warehouses_business_id_businesses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.branchId],
			foreignColumns: [branches.id],
			name: "warehouses_branch_id_branches_id_fk"
		}).onDelete("cascade"),
]);

export const units = pgTable("units", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	code: text().notNull(),
	name: text().notNull(),
	symbol: text(),
	description: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("units_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("units_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("units_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("units_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("units_business_symbol_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.symbol.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "units_business_id_businesses_id_fk"
		}),
]);

export const prescriptionItems = pgTable("prescription_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	prescriptionId: uuid("prescription_id").notNull(),
	productId: uuid("product_id").notNull(),
	lineNumber: integer("line_number").notNull(),
	dosage: text(),
	frequency: text(),
	duration: text(),
	route: text(),
	quantityPrescribed: numeric("quantity_prescribed", { precision: 12, scale:  2 }).notNull(),
	quantityDispensed: numeric("quantity_dispensed", { precision: 12, scale:  2 }).default('0').notNull(),
	substitutionAllowed: boolean("substitution_allowed").default(false).notNull(),
	dispenseAsWritten: boolean("dispense_as_written").default(false).notNull(),
	instructions: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("prescription_items_prescription_idx").using("btree", table.prescriptionId.asc().nullsLast().op("uuid_ops")),
	index("prescription_items_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.prescriptionId],
			foreignColumns: [prescriptions.id],
			name: "prescription_items_prescription_id_prescriptions_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "prescription_items_product_id_products_id_fk"
		}),
]);

export const dispensationItems = pgTable("dispensation_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	dispensationId: uuid("dispensation_id").notNull(),
	prescriptionItemId: uuid("prescription_item_id").notNull(),
	saleItemId: uuid("sale_item_id"),
	productId: uuid("product_id").notNull(),
	productBatchId: uuid("product_batch_id").notNull(),
	quantityDispensed: numeric("quantity_dispensed", { precision: 12, scale:  2 }).notNull(),
	unitPrice: numeric("unit_price", { precision: 12, scale:  2 }).notNull(),
	discountAmount: numeric("discount_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	totalAmount: numeric("total_amount", { precision: 12, scale:  2 }).notNull(),
	taxAmount: numeric("tax_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	directionsGiven: text("directions_given"),
	pharmacistNotes: text("pharmacist_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("dispensation_items_batch_idx").using("btree", table.productBatchId.asc().nullsLast().op("uuid_ops")),
	index("dispensation_items_dispensation_idx").using("btree", table.dispensationId.asc().nullsLast().op("uuid_ops")),
	index("dispensation_items_prescription_item_idx").using("btree", table.prescriptionItemId.asc().nullsLast().op("uuid_ops")),
	index("dispensation_items_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	index("dispensation_items_sale_item_idx").using("btree", table.saleItemId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.dispensationId],
			foreignColumns: [dispensations.id],
			name: "dispensation_items_dispensation_id_dispensations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.prescriptionItemId],
			foreignColumns: [prescriptionItems.id],
			name: "dispensation_items_prescription_item_id_prescription_items_id_f"
		}),
	foreignKey({
			columns: [table.saleItemId],
			foreignColumns: [saleItems.id],
			name: "dispensation_items_sale_item_id_sale_items_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "dispensation_items_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.productBatchId],
			foreignColumns: [productBatches.id],
			name: "dispensation_items_product_batch_id_product_batches_id_fk"
		}),
]);

export const paymentMethods = pgTable("payment_methods", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	code: text().notNull(),
	name: text().notNull(),
	description: text(),
	defaultCashAccountId: uuid("default_cash_account_id"),
	requiresReference: boolean("requires_reference").default(false).notNull(),
	active: boolean().default(true).notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payment_methods_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("payment_methods_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("payment_methods_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("payment_methods_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("uuid_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	index("payment_methods_default_idx").using("btree", table.isDefault.asc().nullsLast().op("bool_ops")),
	index("payment_methods_requires_reference_idx").using("btree", table.requiresReference.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "payment_methods_business_id_businesses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.defaultCashAccountId],
			foreignColumns: [cashAccounts.id],
			name: "payment_methods_default_cash_account_id_cash_accounts_id_fk"
		}),
]);

export const fiscalYears = pgTable("fiscal_years", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	code: text().notNull(),
	name: text().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	isCurrent: boolean("is_current").default(false).notNull(),
	isClosed: boolean("is_closed").default(false).notNull(),
	allowPosting: boolean("allow_posting").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("fiscal_years_allow_posting_idx").using("btree", table.allowPosting.asc().nullsLast().op("bool_ops")),
	uniqueIndex("fiscal_years_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("uuid_ops"), table.code.asc().nullsLast().op("text_ops")),
	index("fiscal_years_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("fiscal_years_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("uuid_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	index("fiscal_years_closed_idx").using("btree", table.isClosed.asc().nullsLast().op("bool_ops")),
	index("fiscal_years_current_idx").using("btree", table.isCurrent.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "fiscal_years_business_id_businesses_id_fk"
		}).onDelete("cascade"),
]);

export const businessSettings = pgTable("business_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	defaultBranchId: uuid("default_branch_id"),
	defaultWarehouseId: uuid("default_warehouse_id"),
	defaultCurrencyId: uuid("default_currency_id"),
	defaultPaymentMethodId: uuid("default_payment_method_id"),
	defaultTaxRateId: uuid("default_tax_rate_id"),
	currentFiscalYearId: uuid("current_fiscal_year_id"),
	allowNegativeStock: boolean("allow_negative_stock").default(false).notNull(),
	autoPostJournals: boolean("auto_post_journals").default(true).notNull(),
	trackInventoryByBatch: boolean("track_inventory_by_batch").default(true).notNull(),
	enableExpiryTracking: boolean("enable_expiry_tracking").default(true).notNull(),
	allowBackdatedTransactions: boolean("allow_backdated_transactions").default(false).notNull(),
	requireCustomerOnSale: boolean("require_customer_on_sale").default(false).notNull(),
	requireSupplierOnPurchase: boolean("require_supplier_on_purchase").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("business_settings_business_unique").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "business_settings_business_id_businesses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.defaultBranchId],
			foreignColumns: [branches.id],
			name: "business_settings_default_branch_id_branches_id_fk"
		}),
	foreignKey({
			columns: [table.defaultWarehouseId],
			foreignColumns: [warehouses.id],
			name: "business_settings_default_warehouse_id_warehouses_id_fk"
		}),
	foreignKey({
			columns: [table.defaultCurrencyId],
			foreignColumns: [currencies.id],
			name: "business_settings_default_currency_id_currencies_id_fk"
		}),
	foreignKey({
			columns: [table.defaultPaymentMethodId],
			foreignColumns: [paymentMethods.id],
			name: "business_settings_default_payment_method_id_payment_methods_id_"
		}),
	foreignKey({
			columns: [table.defaultTaxRateId],
			foreignColumns: [taxRates.id],
			name: "business_settings_default_tax_rate_id_tax_rates_id_fk"
		}),
	foreignKey({
			columns: [table.currentFiscalYearId],
			foreignColumns: [fiscalYears.id],
			name: "business_settings_current_fiscal_year_id_fiscal_years_id_fk"
		}),
]);

export const numberingSequences = pgTable("numbering_sequences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	branchId: uuid("branch_id"),
	documentType: documentType("document_type").notNull(),
	prefix: text().notNull(),
	suffix: text(),
	nextNumber: integer("next_number").default(1).notNull(),
	numberLength: integer("number_length").default(6).notNull(),
	separator: text().default('-').notNull(),
	resetPeriod: text("reset_period").default('NEVER').notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("numbering_sequences_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	index("numbering_sequences_branch_idx").using("btree", table.branchId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("numbering_sequences_business_branch_document_unique").using("btree", table.businessId.asc().nullsLast().op("enum_ops"), table.branchId.asc().nullsLast().op("enum_ops"), table.documentType.asc().nullsLast().op("enum_ops")),
	index("numbering_sequences_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("numbering_sequences_document_type_idx").using("btree", table.documentType.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "numbering_sequences_business_id_businesses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.branchId],
			foreignColumns: [branches.id],
			name: "numbering_sequences_branch_id_branches_id_fk"
		}).onDelete("set null"),
]);

export const branches = pgTable("branches", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	code: text().notNull(),
	name: text().notNull(),
	phone: text(),
	email: text(),
	county: text(),
	town: text(),
	address: text(),
	active: boolean().default(true).notNull(),
	isHeadOffice: boolean("is_head_office").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("branches_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("branches_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("branches_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("branches_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	index("branches_head_office_idx").using("btree", table.isHeadOffice.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "branches_business_id_businesses_id_fk"
		}),
]);

export const currencies = pgTable("currencies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	name: text().notNull(),
	symbol: text().notNull(),
	decimalPlaces: integer("decimal_places").default(2).notNull(),
	active: boolean().default(true).notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("currencies_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("currencies_code_unique").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("currencies_default_idx").using("btree", table.isDefault.asc().nullsLast().op("bool_ops")),
	uniqueIndex("currencies_name_unique").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const insurancePlans = pgTable("insurance_plans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	providerId: uuid("provider_id").notNull(),
	code: text().notNull(),
	name: text().notNull(),
	description: text(),
	annualLimit: numeric("annual_limit", { precision: 12, scale:  2 }),
	visitLimit: numeric("visit_limit", { precision: 12, scale:  2 }),
	effectiveFrom: timestamp("effective_from", { mode: 'string' }),
	effectiveTo: timestamp("effective_to", { mode: 'string' }),
	copayAmount: numeric("copay_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	requiresPreAuthorization: boolean("requires_pre_authorization").default(false).notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("insurance_plans_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("insurance_plans_provider_code_unique").using("btree", table.providerId.asc().nullsLast().op("uuid_ops"), table.code.asc().nullsLast().op("text_ops")),
	index("insurance_plans_provider_idx").using("btree", table.providerId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("insurance_plans_provider_name_unique").using("btree", table.providerId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [insuranceProviders.id],
			name: "insurance_plans_provider_id_insurance_providers_id_fk"
		}).onDelete("cascade"),
]);

export const insuranceMemberships = pgTable("insurance_memberships", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	customerId: uuid("customer_id").notNull(),
	insurancePlanId: uuid("insurance_plan_id").notNull(),
	membershipNumber: text("membership_number").notNull(),
	principalMemberName: text("principal_member_name"),
	relationshipToPrincipal: text("relationship_to_principal"),
	active: boolean().default(true).notNull(),
	effectiveFrom: timestamp("effective_from", { mode: 'string' }),
	effectiveTo: timestamp("effective_to", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("insurance_memberships_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	index("insurance_memberships_customer_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("insurance_memberships_number_unique").using("btree", table.membershipNumber.asc().nullsLast().op("text_ops")),
	index("insurance_memberships_plan_idx").using("btree", table.insurancePlanId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "insurance_memberships_customer_id_customers_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.insurancePlanId],
			foreignColumns: [insurancePlans.id],
			name: "insurance_memberships_insurance_plan_id_insurance_plans_id_fk"
		}),
]);

export const insuranceClaims = pgTable("insurance_claims", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	customerId: uuid("customer_id").notNull(),
	insuranceMembershipId: uuid("insurance_membership_id").notNull(),
	consultationId: uuid("consultation_id"),
	dispensationId: uuid("dispensation_id"),
	claimNumber: text("claim_number").notNull(),
	insurerReference: text("insurer_reference"),
	totalAmount: numeric("total_amount", { precision: 12, scale:  2 }).notNull(),
	approvedAmount: numeric("approved_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	patientResponsibility: numeric("patient_responsibility", { precision: 12, scale:  2 }).default('0').notNull(),
	status: insuranceClaimStatus().default('DRAFT').notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	rejectionReason: text("rejection_reason"),
	serviceDate: timestamp("service_date", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("insurance_claims_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("insurance_claims_business_number_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.claimNumber.asc().nullsLast().op("uuid_ops")),
	index("insurance_claims_consultation_idx").using("btree", table.consultationId.asc().nullsLast().op("uuid_ops")),
	index("insurance_claims_customer_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	index("insurance_claims_dispensation_idx").using("btree", table.dispensationId.asc().nullsLast().op("uuid_ops")),
	index("insurance_claims_membership_idx").using("btree", table.insuranceMembershipId.asc().nullsLast().op("uuid_ops")),
	index("insurance_claims_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "insurance_claims_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "insurance_claims_customer_id_customers_id_fk"
		}),
	foreignKey({
			columns: [table.insuranceMembershipId],
			foreignColumns: [insuranceMemberships.id],
			name: "insurance_claims_insurance_membership_id_insurance_memberships_"
		}),
	foreignKey({
			columns: [table.consultationId],
			foreignColumns: [consultations.id],
			name: "insurance_claims_consultation_id_consultations_id_fk"
		}),
	foreignKey({
			columns: [table.dispensationId],
			foreignColumns: [dispensations.id],
			name: "insurance_claims_dispensation_id_dispensations_id_fk"
		}),
]);

export const insuranceProviders = pgTable("insurance_providers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id"),
	code: text().notNull(),
	name: text().notNull(),
	contactPerson: text("contact_person"),
	phone: text(),
	email: text(),
	address: text(),
	website: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("insurance_providers_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("insurance_providers_business_code_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.code.asc().nullsLast().op("uuid_ops")),
	index("insurance_providers_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("insurance_providers_business_name_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "insurance_providers_business_id_businesses_id_fk"
		}),
]);

export const insuranceClaimItems = pgTable("insurance_claim_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	claimId: uuid("claim_id").notNull(),
	lineNumber: integer("line_number").notNull(),
	productId: uuid("product_id"),
	description: text().notNull(),
	quantity: numeric({ precision: 12, scale:  2 }).default('1').notNull(),
	unitPrice: numeric("unit_price", { precision: 12, scale:  2 }).notNull(),
	covered: boolean().default(true).notNull(),
	claimedAmount: numeric("claimed_amount", { precision: 12, scale:  2 }).notNull(),
	approvedAmount: numeric("approved_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	rejectedAmount: numeric("rejected_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	rejectionReason: text("rejection_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("insurance_claim_items_claim_idx").using("btree", table.claimId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("insurance_claim_items_claim_line_unique").using("btree", table.claimId.asc().nullsLast().op("int4_ops"), table.lineNumber.asc().nullsLast().op("uuid_ops")),
	index("insurance_claim_items_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.claimId],
			foreignColumns: [insuranceClaims.id],
			name: "insurance_claim_items_claim_id_insurance_claims_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "insurance_claim_items_product_id_products_id_fk"
		}),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	saleId: uuid("sale_id").notNull(),
	method: paymentMethod().notNull(),
	status: paymentStatus().default('COMPLETED').notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	reference: text(),
	paidAt: timestamp("paid_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	receivedBy: uuid("received_by").notNull(),
}, (table) => [
	index("payments_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("payments_method_idx").using("btree", table.method.asc().nullsLast().op("enum_ops")),
	index("payments_sale_idx").using("btree", table.saleId.asc().nullsLast().op("uuid_ops")),
	index("payments_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "payments_business_id_businesses_id_fk"
		}),
	foreignKey({
			columns: [table.saleId],
			foreignColumns: [sales.id],
			name: "payments_sale_id_sales_id_fk"
		}),
	foreignKey({
			columns: [table.receivedBy],
			foreignColumns: [users.id],
			name: "payments_received_by_users_id_fk"
		}),
]);

export const appMigrations = pgTable("app_migrations", {
	id: serial().primaryKey().notNull(),
	filename: text().notNull(),
	checksum: text().notNull(),
	executedAt: timestamp("executed_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("app_migrations_filename_key").on(table.filename),
]);

export const supplierReturnItems = pgTable("supplier_return_items", {
	supplierReturnId: uuid("supplier_return_id").notNull(),
	productId: uuid("product_id").notNull(),
	productBatchId: uuid("product_batch_id"),
	quantity: integer().notNull(),
	unitCost: numeric("unit_cost", { precision: 12, scale:  2 }).notNull(),
	total: numeric({ precision: 12, scale:  2 }).notNull(),
	id: uuid().defaultRandom().primaryKey().notNull(),
}, (table) => [
	index("supplier_return_item_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	index("supplier_return_item_return_idx").using("btree", table.supplierReturnId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.supplierReturnId],
			foreignColumns: [supplierReturns.id],
			name: "supplier_return_items_supplier_return_id_supplier_returns_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "supplier_return_items_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.productBatchId],
			foreignColumns: [productBatches.id],
			name: "supplier_return_items_product_batch_id_product_batches_id_fk"
		}),
]);

export const paymentReversals = pgTable("payment_reversals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	paymentId: uuid("payment_id").notNull(),
	reversedBy: uuid("reversed_by").notNull(),
	reason: text().notNull(),
	reversedAt: timestamp("reversed_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payment_reversals_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("payment_reversals_payment_idx").using("btree", table.paymentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "payment_reversals_business_id_businesses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.paymentId],
			foreignColumns: [payments.id],
			name: "payment_reversals_payment_id_payments_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.reversedBy],
			foreignColumns: [users.id],
			name: "payment_reversals_reversed_by_users_id_fk"
		}),
]);

export const journalEntryLines = pgTable("journal_entry_lines", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	journalEntryId: uuid("journal_entry_id").notNull(),
	lineNumber: integer("line_number").notNull(),
	accountId: uuid("account_id").notNull(),
	description: text(),
	debit: numeric({ precision: 18, scale:  2 }).default('0').notNull(),
	credit: numeric({ precision: 18, scale:  2 }).default('0').notNull(),
}, (table) => [
	index("journal_entry_lines_account_idx").using("btree", table.accountId.asc().nullsLast().op("uuid_ops")),
	index("journal_entry_lines_journal_idx").using("btree", table.journalEntryId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("journal_entry_lines_journal_line_unique").using("btree", table.journalEntryId.asc().nullsLast().op("int4_ops"), table.lineNumber.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.journalEntryId],
			foreignColumns: [journalEntries.id],
			name: "journal_entry_lines_journal_entry_id_journal_entries_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [chartOfAccounts.id],
			name: "journal_entry_lines_account_id_chart_of_accounts_id_fk"
		}),
	check("journal_entry_lines_debit_credit_check", sql`((debit > (0)::numeric) AND (credit = (0)::numeric)) OR ((credit > (0)::numeric) AND (debit = (0)::numeric))`),
]);

export const countries = pgTable("countries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	iso3: text().notNull(),
	name: text().notNull(),
	phoneCode: text("phone_code"),
	currencyCode: text("currency_code"),
	timezone: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("countries_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("countries_code_unique").using("btree", table.code.asc().nullsLast().op("text_ops")),
	uniqueIndex("countries_iso3_unique").using("btree", table.iso3.asc().nullsLast().op("text_ops")),
	uniqueIndex("countries_name_unique").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const sales = pgTable("sales", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	customerId: uuid("customer_id"),
	invoiceNumber: text("invoice_number").notNull(),
	status: saleStatus().default('COMPLETED').notNull(),
	subtotal: numeric({ precision: 12, scale:  2 }).default('0'),
	discount: numeric({ precision: 12, scale:  2 }).default('0'),
	tax: numeric({ precision: 12, scale:  2 }).default('0'),
	total: numeric({ precision: 12, scale:  2 }).default('0'),
	notes: text(),
	soldBy: uuid("sold_by").notNull(),
	soldAt: timestamp("sold_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	branchId: uuid("branch_id").notNull(),
	warehouseId: uuid("warehouse_id").notNull(),
	amountPaid: numeric("amount_paid", { precision: 12, scale:  2 }).default('0').notNull(),
	balanceDue: numeric("balance_due", { precision: 12, scale:  2 }).default('0').notNull(),
	paymentStatus: paymentStatus("payment_status").default('PENDING').notNull(),
}, (table) => [
	index("sales_branch_idx").using("btree", table.branchId.asc().nullsLast().op("uuid_ops")),
	index("sales_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("sales_business_invoice_unique").using("btree", table.businessId.asc().nullsLast().op("uuid_ops"), table.invoiceNumber.asc().nullsLast().op("uuid_ops")),
	index("sales_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("sales_customer_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	index("sales_invoice_idx").using("btree", table.invoiceNumber.asc().nullsLast().op("text_ops")),
	index("sales_sold_at_idx").using("btree", table.soldAt.asc().nullsLast().op("timestamp_ops")),
	index("sales_sold_by_idx").using("btree", table.soldBy.asc().nullsLast().op("uuid_ops")),
	index("sales_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("sales_warehouse_idx").using("btree", table.warehouseId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.soldBy],
			foreignColumns: [users.id],
			name: "sales_sold_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "sales_business_id_businesses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "sales_customer_id_customers_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.branchId],
			foreignColumns: [branches.id],
			name: "sales_branch_id_branches_id_fk"
		}),
	foreignKey({
			columns: [table.warehouseId],
			foreignColumns: [warehouses.id],
			name: "sales_warehouse_id_warehouses_id_fk"
		}),
]);

export const inventoryBalances = pgTable("inventory_balances", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	productId: uuid("product_id").notNull(),
	batchId: uuid("batch_id"),
	warehouseId: uuid("warehouse_id").notNull(),
	quantity: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inventory_balance_business_product_warehouse_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops"), table.productId.asc().nullsLast().op("uuid_ops"), table.warehouseId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("inventory_balance_product_batch_warehouse_unique").using("btree", table.productId.asc().nullsLast().op("uuid_ops"), table.batchId.asc().nullsLast().op("uuid_ops"), table.warehouseId.asc().nullsLast().op("uuid_ops")),
	index("inventory_balances_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("inventory_balances_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	index("inventory_balances_warehouse_idx").using("btree", table.warehouseId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "inventory_balances_business_id_businesses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "inventory_balances_product_id_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.batchId],
			foreignColumns: [productBatches.id],
			name: "inventory_balances_batch_id_product_batches_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.warehouseId],
			foreignColumns: [warehouses.id],
			name: "inventory_balances_warehouse_id_warehouses_id_fk"
		}).onDelete("cascade"),
]);

export const userInvitations = pgTable("user_invitations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	roleId: uuid("role_id").notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	passwordHash: text("password_hash"),
	status: text().default('INVITED').notNull(),
}, (table) => [
	uniqueIndex("user_invitations_email_unique").using("btree", table.email.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "user_invitations_role_id_roles_id_fk"
		}),
]);

export const platformUsers = pgTable("platform_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	passwordHash: text("password_hash").notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	role: text().notNull(),
	businessId: uuid("business_id"),
}, (table) => [
	index("platform_users_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	uniqueIndex("platform_users_email_unique").using("btree", table.email.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "platform_users_business_id_businesses_id_fk"
		}),
]);

export const businessCapabilities = pgTable("business_capabilities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	capabilityId: uuid("capability_id").notNull(),
	enabled: boolean().default(true).notNull(),
	source: text().default('PROFILE').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("business_capabilities_business_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("business_capabilities_capability_idx").using("btree", table.capabilityId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "business_capabilities_business_id_businesses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.capabilityId],
			foreignColumns: [capabilities.id],
			name: "business_capabilities_capability_id_capabilities_id_fk"
		}).onDelete("cascade"),
]);

export const capabilities = pgTable("capabilities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	capabilityId: text("capability_id").notNull(),
	name: text().notNull(),
	description: text(),
	module: text().notNull(),
	group: text().notNull(),
	category: text().notNull(),
	status: text().notNull(),
	defaultEnabled: boolean("default_enabled").default(false).notNull(),
	industries: jsonb().default([]),
	dependencies: jsonb().default([]),
	conflicts: jsonb().default([]),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("capabilities_capability_id_idx").using("btree", table.capabilityId.asc().nullsLast().op("text_ops")),
	index("capabilities_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	unique("capabilities_code_unique").on(table.code),
	unique("capabilities_capability_id_unique").on(table.capabilityId),
]);

export const capabilityOverrides = pgTable("capability_overrides", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessCapabilityId: uuid("business_capability_id").notNull(),
	changedBy: uuid("changed_by"),
	previousValue: boolean("previous_value").notNull(),
	newValue: boolean("new_value").notNull(),
	reason: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("capability_override_capability_idx").using("btree", table.businessCapabilityId.asc().nullsLast().op("uuid_ops")),
	index("capability_override_changed_by_idx").using("btree", table.changedBy.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessCapabilityId],
			foreignColumns: [businessCapabilities.id],
			name: "capability_overrides_business_capability_id_business_capabiliti"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "capability_overrides_changed_by_users_id_fk"
		}),
]);

export const rolePermissions = pgTable("role_permissions", {
	roleId: uuid("role_id").notNull(),
	permissionId: uuid("permission_id").notNull(),
}, (table) => [
	index("role_permissions_permission_idx").using("btree", table.permissionId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "role_permissions_role_id_roles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [permissions.id],
			name: "role_permissions_permission_id_permissions_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.roleId, table.permissionId], name: "role_permissions_role_id_permission_id_pk"}),
]);

export const userPermissions = pgTable("user_permissions", {
	userId: uuid("user_id").notNull(),
	permissionId: uuid("permission_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_permissions_permission_idx").using("btree", table.permissionId.asc().nullsLast().op("uuid_ops")),
	index("user_permissions_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_permissions_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [permissions.id],
			name: "user_permissions_permission_id_permissions_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.permissionId], name: "user_permissions_user_id_permission_id_pk"}),
]);
