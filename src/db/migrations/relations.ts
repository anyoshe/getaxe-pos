import { relations } from "drizzle-orm/relations";
import { businesses, users, roles, categories, suppliers, products, manufacturers, drugCategories, dosageForms, drugStrengths, prescriptionTypes, units, chartOfAccounts, taxRates, productBatches, purchaseOrders, purchaseOrderItems, stockMovements, warehouses, saleItems, sales, loginHistory, saleItemBatches, saleReturns, saleReturnItems, customers, activityLogs, supplierReturns, goodsReceipts, goodsReceiptItems, apiKeys, cashAccounts, diagnoses, accountCategories, accountTypes, expenseCategories, expenses, incomeCategories, consultations, branches, consultationDiagnoses, productPrices, priceLists, prescriptions, incomes, journalEntries, dispensations, prescriptionItems, dispensationItems, paymentMethods, fiscalYears, businessSettings, currencies, numberingSequences, insuranceProviders, insurancePlans, insuranceMemberships, insuranceClaims, insuranceClaimItems, payments, supplierReturnItems, paymentReversals, journalEntryLines, inventoryBalances, userInvitations, platformUsers, businessCapabilities, capabilities, capabilityOverrides, rolePermissions, permissions, userPermissions } from "./schema";

export const usersRelations = relations(users, ({one, many}) => ({
	business: one(businesses, {
		fields: [users.businessId],
		references: [businesses.id]
	}),
	role: one(roles, {
		fields: [users.roleId],
		references: [roles.id]
	}),
	purchaseOrders_orderedBy: many(purchaseOrders, {
		relationName: "purchaseOrders_orderedBy_users_id"
	}),
	purchaseOrders_approvedBy: many(purchaseOrders, {
		relationName: "purchaseOrders_approvedBy_users_id"
	}),
	stockMovements: many(stockMovements),
	loginHistories: many(loginHistory),
	saleReturns_createdBy: many(saleReturns, {
		relationName: "saleReturns_createdBy_users_id"
	}),
	saleReturns_approvedBy: many(saleReturns, {
		relationName: "saleReturns_approvedBy_users_id"
	}),
	activityLogs: many(activityLogs),
	supplierReturns: many(supplierReturns),
	goodsReceipts: many(goodsReceipts),
	expenses: many(expenses),
	consultations: many(consultations),
	incomes: many(incomes),
	journalEntries: many(journalEntries),
	dispensations_dispensedBy: many(dispensations, {
		relationName: "dispensations_dispensedBy_users_id"
	}),
	dispensations_checkedBy: many(dispensations, {
		relationName: "dispensations_checkedBy_users_id"
	}),
	payments: many(payments),
	paymentReversals: many(paymentReversals),
	sales: many(sales),
	capabilityOverrides: many(capabilityOverrides),
	userPermissions: many(userPermissions),
}));

export const businessesRelations = relations(businesses, ({many}) => ({
	users: many(users),
	roles: many(roles),
	categories: many(categories),
	suppliers: many(suppliers),
	products: many(products),
	productBatches: many(productBatches),
	purchaseOrders: many(purchaseOrders),
	stockMovements: many(stockMovements),
	saleItems: many(saleItems),
	loginHistories: many(loginHistory),
	saleReturns: many(saleReturns),
	activityLogs: many(activityLogs),
	supplierReturns: many(supplierReturns),
	customers: many(customers),
	goodsReceipts: many(goodsReceipts),
	apiKeys: many(apiKeys),
	cashAccounts: many(cashAccounts),
	diagnoses: many(diagnoses),
	accountCategories: many(accountCategories),
	accountTypes: many(accountTypes),
	chartOfAccounts: many(chartOfAccounts),
	expenseCategories: many(expenseCategories),
	expenses: many(expenses),
	incomeCategories: many(incomeCategories),
	consultations: many(consultations),
	taxRates: many(taxRates),
	productPrices: many(productPrices),
	drugCategories: many(drugCategories),
	drugStrengths: many(drugStrengths),
	dosageForms: many(dosageForms),
	manufacturers: many(manufacturers),
	prescriptionTypes: many(prescriptionTypes),
	prescriptions: many(prescriptions),
	incomes: many(incomes),
	journalEntries: many(journalEntries),
	priceLists: many(priceLists),
	dispensations: many(dispensations),
	warehouses: many(warehouses),
	units: many(units),
	paymentMethods: many(paymentMethods),
	fiscalYears: many(fiscalYears),
	businessSettings: many(businessSettings),
	numberingSequences: many(numberingSequences),
	branches: many(branches),
	insuranceClaims: many(insuranceClaims),
	insuranceProviders: many(insuranceProviders),
	payments: many(payments),
	paymentReversals: many(paymentReversals),
	sales: many(sales),
	inventoryBalances: many(inventoryBalances),
	platformUsers: many(platformUsers),
	businessCapabilities: many(businessCapabilities),
}));

export const rolesRelations = relations(roles, ({one, many}) => ({
	users: many(users),
	business: one(businesses, {
		fields: [roles.businessId],
		references: [businesses.id]
	}),
	userInvitations: many(userInvitations),
	rolePermissions: many(rolePermissions),
}));

export const categoriesRelations = relations(categories, ({one, many}) => ({
	business: one(businesses, {
		fields: [categories.businessId],
		references: [businesses.id]
	}),
	products: many(products),
}));

export const suppliersRelations = relations(suppliers, ({one, many}) => ({
	business: one(businesses, {
		fields: [suppliers.businessId],
		references: [businesses.id]
	}),
	products: many(products),
	productBatches: many(productBatches),
	purchaseOrders: many(purchaseOrders),
	supplierReturns: many(supplierReturns),
	goodsReceipts: many(goodsReceipts),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	business: one(businesses, {
		fields: [products.businessId],
		references: [businesses.id]
	}),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	supplier: one(suppliers, {
		fields: [products.supplierId],
		references: [suppliers.id]
	}),
	manufacturer: one(manufacturers, {
		fields: [products.manufacturerId],
		references: [manufacturers.id]
	}),
	drugCategory: one(drugCategories, {
		fields: [products.drugCategoryId],
		references: [drugCategories.id]
	}),
	dosageForm: one(dosageForms, {
		fields: [products.dosageFormId],
		references: [dosageForms.id]
	}),
	drugStrength: one(drugStrengths, {
		fields: [products.drugStrengthId],
		references: [drugStrengths.id]
	}),
	prescriptionType: one(prescriptionTypes, {
		fields: [products.prescriptionTypeId],
		references: [prescriptionTypes.id]
	}),
	unit_purchaseUnitId: one(units, {
		fields: [products.purchaseUnitId],
		references: [units.id],
		relationName: "products_purchaseUnitId_units_id"
	}),
	unit_salesUnitId: one(units, {
		fields: [products.salesUnitId],
		references: [units.id],
		relationName: "products_salesUnitId_units_id"
	}),
	unit_stockUnitId: one(units, {
		fields: [products.stockUnitId],
		references: [units.id],
		relationName: "products_stockUnitId_units_id"
	}),
	chartOfAccount_incomeAccountId: one(chartOfAccounts, {
		fields: [products.incomeAccountId],
		references: [chartOfAccounts.id],
		relationName: "products_incomeAccountId_chartOfAccounts_id"
	}),
	chartOfAccount_expenseAccountId: one(chartOfAccounts, {
		fields: [products.expenseAccountId],
		references: [chartOfAccounts.id],
		relationName: "products_expenseAccountId_chartOfAccounts_id"
	}),
	chartOfAccount_inventoryAccountId: one(chartOfAccounts, {
		fields: [products.inventoryAccountId],
		references: [chartOfAccounts.id],
		relationName: "products_inventoryAccountId_chartOfAccounts_id"
	}),
	taxRate: one(taxRates, {
		fields: [products.taxRateId],
		references: [taxRates.id]
	}),
	productBatches: many(productBatches),
	purchaseOrderItems: many(purchaseOrderItems),
	stockMovements: many(stockMovements),
	saleItems: many(saleItems),
	goodsReceiptItems: many(goodsReceiptItems),
	productPrices: many(productPrices),
	prescriptionItems: many(prescriptionItems),
	dispensationItems: many(dispensationItems),
	insuranceClaimItems: many(insuranceClaimItems),
	supplierReturnItems: many(supplierReturnItems),
	inventoryBalances: many(inventoryBalances),
}));

export const manufacturersRelations = relations(manufacturers, ({one, many}) => ({
	products: many(products),
	business: one(businesses, {
		fields: [manufacturers.businessId],
		references: [businesses.id]
	}),
}));

export const drugCategoriesRelations = relations(drugCategories, ({one, many}) => ({
	products: many(products),
	business: one(businesses, {
		fields: [drugCategories.businessId],
		references: [businesses.id]
	}),
}));

export const dosageFormsRelations = relations(dosageForms, ({one, many}) => ({
	products: many(products),
	business: one(businesses, {
		fields: [dosageForms.businessId],
		references: [businesses.id]
	}),
}));

export const drugStrengthsRelations = relations(drugStrengths, ({one, many}) => ({
	products: many(products),
	business: one(businesses, {
		fields: [drugStrengths.businessId],
		references: [businesses.id]
	}),
}));

export const prescriptionTypesRelations = relations(prescriptionTypes, ({one, many}) => ({
	products: many(products),
	business: one(businesses, {
		fields: [prescriptionTypes.businessId],
		references: [businesses.id]
	}),
}));

export const unitsRelations = relations(units, ({one, many}) => ({
	products_purchaseUnitId: many(products, {
		relationName: "products_purchaseUnitId_units_id"
	}),
	products_salesUnitId: many(products, {
		relationName: "products_salesUnitId_units_id"
	}),
	products_stockUnitId: many(products, {
		relationName: "products_stockUnitId_units_id"
	}),
	business: one(businesses, {
		fields: [units.businessId],
		references: [businesses.id]
	}),
}));

export const chartOfAccountsRelations = relations(chartOfAccounts, ({one, many}) => ({
	products_incomeAccountId: many(products, {
		relationName: "products_incomeAccountId_chartOfAccounts_id"
	}),
	products_expenseAccountId: many(products, {
		relationName: "products_expenseAccountId_chartOfAccounts_id"
	}),
	products_inventoryAccountId: many(products, {
		relationName: "products_inventoryAccountId_chartOfAccounts_id"
	}),
	cashAccounts: many(cashAccounts),
	business: one(businesses, {
		fields: [chartOfAccounts.businessId],
		references: [businesses.id]
	}),
	accountCategory: one(accountCategories, {
		fields: [chartOfAccounts.accountCategoryId],
		references: [accountCategories.id]
	}),
	chartOfAccount: one(chartOfAccounts, {
		fields: [chartOfAccounts.parentAccountId],
		references: [chartOfAccounts.id],
		relationName: "chartOfAccounts_parentAccountId_chartOfAccounts_id"
	}),
	chartOfAccounts: many(chartOfAccounts, {
		relationName: "chartOfAccounts_parentAccountId_chartOfAccounts_id"
	}),
	journalEntryLines: many(journalEntryLines),
}));

export const taxRatesRelations = relations(taxRates, ({one, many}) => ({
	products: many(products),
	business: one(businesses, {
		fields: [taxRates.businessId],
		references: [businesses.id]
	}),
	businessSettings: many(businessSettings),
}));

export const productBatchesRelations = relations(productBatches, ({one, many}) => ({
	business: one(businesses, {
		fields: [productBatches.businessId],
		references: [businesses.id]
	}),
	product: one(products, {
		fields: [productBatches.productId],
		references: [products.id]
	}),
	supplier: one(suppliers, {
		fields: [productBatches.supplierId],
		references: [suppliers.id]
	}),
	stockMovements: many(stockMovements),
	saleItemBatches: many(saleItemBatches),
	saleReturnItems: many(saleReturnItems),
	dispensationItems: many(dispensationItems),
	supplierReturnItems: many(supplierReturnItems),
	inventoryBalances: many(inventoryBalances),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({one, many}) => ({
	business: one(businesses, {
		fields: [purchaseOrders.businessId],
		references: [businesses.id]
	}),
	supplier: one(suppliers, {
		fields: [purchaseOrders.supplierId],
		references: [suppliers.id]
	}),
	user_orderedBy: one(users, {
		fields: [purchaseOrders.orderedBy],
		references: [users.id],
		relationName: "purchaseOrders_orderedBy_users_id"
	}),
	user_approvedBy: one(users, {
		fields: [purchaseOrders.approvedBy],
		references: [users.id],
		relationName: "purchaseOrders_approvedBy_users_id"
	}),
	purchaseOrderItems: many(purchaseOrderItems),
	goodsReceipts: many(goodsReceipts),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({one}) => ({
	purchaseOrder: one(purchaseOrders, {
		fields: [purchaseOrderItems.purchaseOrderId],
		references: [purchaseOrders.id]
	}),
	product: one(products, {
		fields: [purchaseOrderItems.productId],
		references: [products.id]
	}),
}));

export const stockMovementsRelations = relations(stockMovements, ({one}) => ({
	business: one(businesses, {
		fields: [stockMovements.businessId],
		references: [businesses.id]
	}),
	product: one(products, {
		fields: [stockMovements.productId],
		references: [products.id]
	}),
	productBatch: one(productBatches, {
		fields: [stockMovements.batchId],
		references: [productBatches.id]
	}),
	user: one(users, {
		fields: [stockMovements.userId],
		references: [users.id]
	}),
	warehouse: one(warehouses, {
		fields: [stockMovements.warehouseId],
		references: [warehouses.id]
	}),
}));

export const warehousesRelations = relations(warehouses, ({one, many}) => ({
	stockMovements: many(stockMovements),
	dispensations: many(dispensations),
	business: one(businesses, {
		fields: [warehouses.businessId],
		references: [businesses.id]
	}),
	branch: one(branches, {
		fields: [warehouses.branchId],
		references: [branches.id]
	}),
	businessSettings: many(businessSettings),
	sales: many(sales),
	inventoryBalances: many(inventoryBalances),
}));

export const saleItemsRelations = relations(saleItems, ({one, many}) => ({
	business: one(businesses, {
		fields: [saleItems.businessId],
		references: [businesses.id]
	}),
	sale: one(sales, {
		fields: [saleItems.saleId],
		references: [sales.id]
	}),
	product: one(products, {
		fields: [saleItems.productId],
		references: [products.id]
	}),
	saleItemBatches: many(saleItemBatches),
	saleReturnItems: many(saleReturnItems),
	dispensationItems: many(dispensationItems),
}));

export const salesRelations = relations(sales, ({one, many}) => ({
	saleItems: many(saleItems),
	saleReturns: many(saleReturns),
	dispensations: many(dispensations),
	payments: many(payments),
	user: one(users, {
		fields: [sales.soldBy],
		references: [users.id]
	}),
	business: one(businesses, {
		fields: [sales.businessId],
		references: [businesses.id]
	}),
	customer: one(customers, {
		fields: [sales.customerId],
		references: [customers.id]
	}),
	branch: one(branches, {
		fields: [sales.branchId],
		references: [branches.id]
	}),
	warehouse: one(warehouses, {
		fields: [sales.warehouseId],
		references: [warehouses.id]
	}),
}));

export const loginHistoryRelations = relations(loginHistory, ({one}) => ({
	business: one(businesses, {
		fields: [loginHistory.businessId],
		references: [businesses.id]
	}),
	user: one(users, {
		fields: [loginHistory.userId],
		references: [users.id]
	}),
}));

export const saleItemBatchesRelations = relations(saleItemBatches, ({one}) => ({
	saleItem: one(saleItems, {
		fields: [saleItemBatches.saleItemId],
		references: [saleItems.id]
	}),
	productBatch: one(productBatches, {
		fields: [saleItemBatches.productBatchId],
		references: [productBatches.id]
	}),
}));

export const saleReturnItemsRelations = relations(saleReturnItems, ({one}) => ({
	saleReturn: one(saleReturns, {
		fields: [saleReturnItems.saleReturnId],
		references: [saleReturns.id]
	}),
	saleItem: one(saleItems, {
		fields: [saleReturnItems.saleItemId],
		references: [saleItems.id]
	}),
	productBatch: one(productBatches, {
		fields: [saleReturnItems.productBatchId],
		references: [productBatches.id]
	}),
}));

export const saleReturnsRelations = relations(saleReturns, ({one, many}) => ({
	saleReturnItems: many(saleReturnItems),
	user_createdBy: one(users, {
		fields: [saleReturns.createdBy],
		references: [users.id],
		relationName: "saleReturns_createdBy_users_id"
	}),
	user_approvedBy: one(users, {
		fields: [saleReturns.approvedBy],
		references: [users.id],
		relationName: "saleReturns_approvedBy_users_id"
	}),
	business: one(businesses, {
		fields: [saleReturns.businessId],
		references: [businesses.id]
	}),
	sale: one(sales, {
		fields: [saleReturns.saleId],
		references: [sales.id]
	}),
	customer: one(customers, {
		fields: [saleReturns.customerId],
		references: [customers.id]
	}),
}));

export const customersRelations = relations(customers, ({one, many}) => ({
	saleReturns: many(saleReturns),
	business: one(businesses, {
		fields: [customers.businessId],
		references: [businesses.id]
	}),
	consultations: many(consultations),
	prescriptions: many(prescriptions),
	insuranceMemberships: many(insuranceMemberships),
	insuranceClaims: many(insuranceClaims),
	sales: many(sales),
}));

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	business: one(businesses, {
		fields: [activityLogs.businessId],
		references: [businesses.id]
	}),
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id]
	}),
}));

export const supplierReturnsRelations = relations(supplierReturns, ({one, many}) => ({
	business: one(businesses, {
		fields: [supplierReturns.businessId],
		references: [businesses.id]
	}),
	supplier: one(suppliers, {
		fields: [supplierReturns.supplierId],
		references: [suppliers.id]
	}),
	user: one(users, {
		fields: [supplierReturns.createdBy],
		references: [users.id]
	}),
	supplierReturnItems: many(supplierReturnItems),
}));

export const goodsReceiptItemsRelations = relations(goodsReceiptItems, ({one}) => ({
	goodsReceipt: one(goodsReceipts, {
		fields: [goodsReceiptItems.goodsReceiptId],
		references: [goodsReceipts.id]
	}),
	product: one(products, {
		fields: [goodsReceiptItems.productId],
		references: [products.id]
	}),
}));

export const goodsReceiptsRelations = relations(goodsReceipts, ({one, many}) => ({
	goodsReceiptItems: many(goodsReceiptItems),
	business: one(businesses, {
		fields: [goodsReceipts.businessId],
		references: [businesses.id]
	}),
	purchaseOrder: one(purchaseOrders, {
		fields: [goodsReceipts.purchaseOrderId],
		references: [purchaseOrders.id]
	}),
	supplier: one(suppliers, {
		fields: [goodsReceipts.supplierId],
		references: [suppliers.id]
	}),
	user: one(users, {
		fields: [goodsReceipts.receivedBy],
		references: [users.id]
	}),
}));

export const apiKeysRelations = relations(apiKeys, ({one}) => ({
	business: one(businesses, {
		fields: [apiKeys.businessId],
		references: [businesses.id]
	}),
}));

export const cashAccountsRelations = relations(cashAccounts, ({one, many}) => ({
	business: one(businesses, {
		fields: [cashAccounts.businessId],
		references: [businesses.id]
	}),
	chartOfAccount: one(chartOfAccounts, {
		fields: [cashAccounts.accountId],
		references: [chartOfAccounts.id]
	}),
	expenses: many(expenses),
	incomes: many(incomes),
	paymentMethods: many(paymentMethods),
}));

export const diagnosesRelations = relations(diagnoses, ({one, many}) => ({
	business: one(businesses, {
		fields: [diagnoses.businessId],
		references: [businesses.id]
	}),
	consultationDiagnoses: many(consultationDiagnoses),
}));

export const accountCategoriesRelations = relations(accountCategories, ({one, many}) => ({
	business: one(businesses, {
		fields: [accountCategories.businessId],
		references: [businesses.id]
	}),
	accountType: one(accountTypes, {
		fields: [accountCategories.accountTypeId],
		references: [accountTypes.id]
	}),
	chartOfAccounts: many(chartOfAccounts),
}));

export const accountTypesRelations = relations(accountTypes, ({one, many}) => ({
	accountCategories: many(accountCategories),
	business: one(businesses, {
		fields: [accountTypes.businessId],
		references: [businesses.id]
	}),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({one, many}) => ({
	business: one(businesses, {
		fields: [expenseCategories.businessId],
		references: [businesses.id]
	}),
	expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	business: one(businesses, {
		fields: [expenses.businessId],
		references: [businesses.id]
	}),
	expenseCategory: one(expenseCategories, {
		fields: [expenses.categoryId],
		references: [expenseCategories.id]
	}),
	cashAccount: one(cashAccounts, {
		fields: [expenses.cashAccountId],
		references: [cashAccounts.id]
	}),
	user: one(users, {
		fields: [expenses.createdBy],
		references: [users.id]
	}),
}));

export const incomeCategoriesRelations = relations(incomeCategories, ({one, many}) => ({
	business: one(businesses, {
		fields: [incomeCategories.businessId],
		references: [businesses.id]
	}),
	incomes: many(incomes),
}));

export const consultationsRelations = relations(consultations, ({one, many}) => ({
	business: one(businesses, {
		fields: [consultations.businessId],
		references: [businesses.id]
	}),
	branch: one(branches, {
		fields: [consultations.branchId],
		references: [branches.id]
	}),
	customer: one(customers, {
		fields: [consultations.customerId],
		references: [customers.id]
	}),
	user: one(users, {
		fields: [consultations.clinicianId],
		references: [users.id]
	}),
	consultationDiagnoses: many(consultationDiagnoses),
	prescriptions: many(prescriptions),
	insuranceClaims: many(insuranceClaims),
}));

export const branchesRelations = relations(branches, ({one, many}) => ({
	consultations: many(consultations),
	dispensations: many(dispensations),
	warehouses: many(warehouses),
	businessSettings: many(businessSettings),
	numberingSequences: many(numberingSequences),
	business: one(businesses, {
		fields: [branches.businessId],
		references: [businesses.id]
	}),
	sales: many(sales),
}));

export const consultationDiagnosesRelations = relations(consultationDiagnoses, ({one}) => ({
	consultation: one(consultations, {
		fields: [consultationDiagnoses.consultationId],
		references: [consultations.id]
	}),
	diagnosis: one(diagnoses, {
		fields: [consultationDiagnoses.diagnosisId],
		references: [diagnoses.id]
	}),
}));

export const productPricesRelations = relations(productPrices, ({one}) => ({
	business: one(businesses, {
		fields: [productPrices.businessId],
		references: [businesses.id]
	}),
	product: one(products, {
		fields: [productPrices.productId],
		references: [products.id]
	}),
	priceList: one(priceLists, {
		fields: [productPrices.priceListId],
		references: [priceLists.id]
	}),
}));

export const priceListsRelations = relations(priceLists, ({one, many}) => ({
	productPrices: many(productPrices),
	business: one(businesses, {
		fields: [priceLists.businessId],
		references: [businesses.id]
	}),
}));

export const prescriptionsRelations = relations(prescriptions, ({one, many}) => ({
	business: one(businesses, {
		fields: [prescriptions.businessId],
		references: [businesses.id]
	}),
	customer: one(customers, {
		fields: [prescriptions.customerId],
		references: [customers.id]
	}),
	consultation: one(consultations, {
		fields: [prescriptions.consultationId],
		references: [consultations.id]
	}),
	dispensations: many(dispensations),
	prescriptionItems: many(prescriptionItems),
}));

export const incomesRelations = relations(incomes, ({one}) => ({
	business: one(businesses, {
		fields: [incomes.businessId],
		references: [businesses.id]
	}),
	incomeCategory: one(incomeCategories, {
		fields: [incomes.categoryId],
		references: [incomeCategories.id]
	}),
	cashAccount: one(cashAccounts, {
		fields: [incomes.cashAccountId],
		references: [cashAccounts.id]
	}),
	user: one(users, {
		fields: [incomes.receivedBy],
		references: [users.id]
	}),
}));

export const journalEntriesRelations = relations(journalEntries, ({one, many}) => ({
	business: one(businesses, {
		fields: [journalEntries.businessId],
		references: [businesses.id]
	}),
	user: one(users, {
		fields: [journalEntries.postedBy],
		references: [users.id]
	}),
	journalEntryLines: many(journalEntryLines),
}));

export const dispensationsRelations = relations(dispensations, ({one, many}) => ({
	business: one(businesses, {
		fields: [dispensations.businessId],
		references: [businesses.id]
	}),
	branch: one(branches, {
		fields: [dispensations.branchId],
		references: [branches.id]
	}),
	warehouse: one(warehouses, {
		fields: [dispensations.warehouseId],
		references: [warehouses.id]
	}),
	prescription: one(prescriptions, {
		fields: [dispensations.prescriptionId],
		references: [prescriptions.id]
	}),
	sale: one(sales, {
		fields: [dispensations.saleId],
		references: [sales.id]
	}),
	user_dispensedBy: one(users, {
		fields: [dispensations.dispensedBy],
		references: [users.id],
		relationName: "dispensations_dispensedBy_users_id"
	}),
	user_checkedBy: one(users, {
		fields: [dispensations.checkedBy],
		references: [users.id],
		relationName: "dispensations_checkedBy_users_id"
	}),
	dispensationItems: many(dispensationItems),
	insuranceClaims: many(insuranceClaims),
}));

export const prescriptionItemsRelations = relations(prescriptionItems, ({one, many}) => ({
	prescription: one(prescriptions, {
		fields: [prescriptionItems.prescriptionId],
		references: [prescriptions.id]
	}),
	product: one(products, {
		fields: [prescriptionItems.productId],
		references: [products.id]
	}),
	dispensationItems: many(dispensationItems),
}));

export const dispensationItemsRelations = relations(dispensationItems, ({one}) => ({
	dispensation: one(dispensations, {
		fields: [dispensationItems.dispensationId],
		references: [dispensations.id]
	}),
	prescriptionItem: one(prescriptionItems, {
		fields: [dispensationItems.prescriptionItemId],
		references: [prescriptionItems.id]
	}),
	saleItem: one(saleItems, {
		fields: [dispensationItems.saleItemId],
		references: [saleItems.id]
	}),
	product: one(products, {
		fields: [dispensationItems.productId],
		references: [products.id]
	}),
	productBatch: one(productBatches, {
		fields: [dispensationItems.productBatchId],
		references: [productBatches.id]
	}),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({one, many}) => ({
	business: one(businesses, {
		fields: [paymentMethods.businessId],
		references: [businesses.id]
	}),
	cashAccount: one(cashAccounts, {
		fields: [paymentMethods.defaultCashAccountId],
		references: [cashAccounts.id]
	}),
	businessSettings: many(businessSettings),
}));

export const fiscalYearsRelations = relations(fiscalYears, ({one, many}) => ({
	business: one(businesses, {
		fields: [fiscalYears.businessId],
		references: [businesses.id]
	}),
	businessSettings: many(businessSettings),
}));

export const businessSettingsRelations = relations(businessSettings, ({one}) => ({
	business: one(businesses, {
		fields: [businessSettings.businessId],
		references: [businesses.id]
	}),
	branch: one(branches, {
		fields: [businessSettings.defaultBranchId],
		references: [branches.id]
	}),
	warehouse: one(warehouses, {
		fields: [businessSettings.defaultWarehouseId],
		references: [warehouses.id]
	}),
	currency: one(currencies, {
		fields: [businessSettings.defaultCurrencyId],
		references: [currencies.id]
	}),
	paymentMethod: one(paymentMethods, {
		fields: [businessSettings.defaultPaymentMethodId],
		references: [paymentMethods.id]
	}),
	taxRate: one(taxRates, {
		fields: [businessSettings.defaultTaxRateId],
		references: [taxRates.id]
	}),
	fiscalYear: one(fiscalYears, {
		fields: [businessSettings.currentFiscalYearId],
		references: [fiscalYears.id]
	}),
}));

export const currenciesRelations = relations(currencies, ({many}) => ({
	businessSettings: many(businessSettings),
}));

export const numberingSequencesRelations = relations(numberingSequences, ({one}) => ({
	business: one(businesses, {
		fields: [numberingSequences.businessId],
		references: [businesses.id]
	}),
	branch: one(branches, {
		fields: [numberingSequences.branchId],
		references: [branches.id]
	}),
}));

export const insurancePlansRelations = relations(insurancePlans, ({one, many}) => ({
	insuranceProvider: one(insuranceProviders, {
		fields: [insurancePlans.providerId],
		references: [insuranceProviders.id]
	}),
	insuranceMemberships: many(insuranceMemberships),
}));

export const insuranceProvidersRelations = relations(insuranceProviders, ({one, many}) => ({
	insurancePlans: many(insurancePlans),
	business: one(businesses, {
		fields: [insuranceProviders.businessId],
		references: [businesses.id]
	}),
}));

export const insuranceMembershipsRelations = relations(insuranceMemberships, ({one, many}) => ({
	customer: one(customers, {
		fields: [insuranceMemberships.customerId],
		references: [customers.id]
	}),
	insurancePlan: one(insurancePlans, {
		fields: [insuranceMemberships.insurancePlanId],
		references: [insurancePlans.id]
	}),
	insuranceClaims: many(insuranceClaims),
}));

export const insuranceClaimsRelations = relations(insuranceClaims, ({one, many}) => ({
	business: one(businesses, {
		fields: [insuranceClaims.businessId],
		references: [businesses.id]
	}),
	customer: one(customers, {
		fields: [insuranceClaims.customerId],
		references: [customers.id]
	}),
	insuranceMembership: one(insuranceMemberships, {
		fields: [insuranceClaims.insuranceMembershipId],
		references: [insuranceMemberships.id]
	}),
	consultation: one(consultations, {
		fields: [insuranceClaims.consultationId],
		references: [consultations.id]
	}),
	dispensation: one(dispensations, {
		fields: [insuranceClaims.dispensationId],
		references: [dispensations.id]
	}),
	insuranceClaimItems: many(insuranceClaimItems),
}));

export const insuranceClaimItemsRelations = relations(insuranceClaimItems, ({one}) => ({
	insuranceClaim: one(insuranceClaims, {
		fields: [insuranceClaimItems.claimId],
		references: [insuranceClaims.id]
	}),
	product: one(products, {
		fields: [insuranceClaimItems.productId],
		references: [products.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one, many}) => ({
	business: one(businesses, {
		fields: [payments.businessId],
		references: [businesses.id]
	}),
	sale: one(sales, {
		fields: [payments.saleId],
		references: [sales.id]
	}),
	user: one(users, {
		fields: [payments.receivedBy],
		references: [users.id]
	}),
	paymentReversals: many(paymentReversals),
}));

export const supplierReturnItemsRelations = relations(supplierReturnItems, ({one}) => ({
	supplierReturn: one(supplierReturns, {
		fields: [supplierReturnItems.supplierReturnId],
		references: [supplierReturns.id]
	}),
	product: one(products, {
		fields: [supplierReturnItems.productId],
		references: [products.id]
	}),
	productBatch: one(productBatches, {
		fields: [supplierReturnItems.productBatchId],
		references: [productBatches.id]
	}),
}));

export const paymentReversalsRelations = relations(paymentReversals, ({one}) => ({
	business: one(businesses, {
		fields: [paymentReversals.businessId],
		references: [businesses.id]
	}),
	payment: one(payments, {
		fields: [paymentReversals.paymentId],
		references: [payments.id]
	}),
	user: one(users, {
		fields: [paymentReversals.reversedBy],
		references: [users.id]
	}),
}));

export const journalEntryLinesRelations = relations(journalEntryLines, ({one}) => ({
	journalEntry: one(journalEntries, {
		fields: [journalEntryLines.journalEntryId],
		references: [journalEntries.id]
	}),
	chartOfAccount: one(chartOfAccounts, {
		fields: [journalEntryLines.accountId],
		references: [chartOfAccounts.id]
	}),
}));

export const inventoryBalancesRelations = relations(inventoryBalances, ({one}) => ({
	business: one(businesses, {
		fields: [inventoryBalances.businessId],
		references: [businesses.id]
	}),
	product: one(products, {
		fields: [inventoryBalances.productId],
		references: [products.id]
	}),
	productBatch: one(productBatches, {
		fields: [inventoryBalances.batchId],
		references: [productBatches.id]
	}),
	warehouse: one(warehouses, {
		fields: [inventoryBalances.warehouseId],
		references: [warehouses.id]
	}),
}));

export const userInvitationsRelations = relations(userInvitations, ({one}) => ({
	role: one(roles, {
		fields: [userInvitations.roleId],
		references: [roles.id]
	}),
}));

export const platformUsersRelations = relations(platformUsers, ({one}) => ({
	business: one(businesses, {
		fields: [platformUsers.businessId],
		references: [businesses.id]
	}),
}));

export const businessCapabilitiesRelations = relations(businessCapabilities, ({one, many}) => ({
	business: one(businesses, {
		fields: [businessCapabilities.businessId],
		references: [businesses.id]
	}),
	capability: one(capabilities, {
		fields: [businessCapabilities.capabilityId],
		references: [capabilities.id]
	}),
	capabilityOverrides: many(capabilityOverrides),
}));

export const capabilitiesRelations = relations(capabilities, ({many}) => ({
	businessCapabilities: many(businessCapabilities),
}));

export const capabilityOverridesRelations = relations(capabilityOverrides, ({one}) => ({
	businessCapability: one(businessCapabilities, {
		fields: [capabilityOverrides.businessCapabilityId],
		references: [businessCapabilities.id]
	}),
	user: one(users, {
		fields: [capabilityOverrides.changedBy],
		references: [users.id]
	}),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	rolePermissions: many(rolePermissions),
	userPermissions: many(userPermissions),
}));

export const userPermissionsRelations = relations(userPermissions, ({one}) => ({
	user: one(users, {
		fields: [userPermissions.userId],
		references: [users.id]
	}),
	permission: one(permissions, {
		fields: [userPermissions.permissionId],
		references: [permissions.id]
	}),
}));