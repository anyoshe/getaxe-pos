# GetAxe — User manual for an **existing** business

**Audience:** Business owners and managers who already trade (chemist, hardware, agrovet, fish depot, spare parts, general shop, etc.) and are joining GetAxe.

**Goal:** Follow these steps until you can confidently say:

> “We are 100% ready to sell on GetAxe POS.”

This manual matches how the system works today. You do **not** need to type every product by hand.

---

## What “100% ready to sell” means

You are ready when **all** of the following are true:

| # | Ready when… |
|---|-------------|
| 1 | You can log in and open **Dashboard** |
| 2 | **Branch** and **main warehouse** exist |
| 3 | **Units** (PCS, BOX, KG, etc.) exist for how you buy and sell |
| 4 | **Cash / bank / M-Pesa tills** exist and opening cash is set if you already held money |
| 5 | **Products** you sell exist (from starter kit and/or Excel import — not only one-by-one) |
| 6 | **Selling prices** exist (from product sell price, category markup, or Product prices) |
| 7 | **Stock on hand** is in the system (opening stock or GRN) for items you will sell |
| 8 | You completed a **test cash sale** on POS and saw stock and cash move |
| 9 | **Settings → Go-live readiness** is complete (or all critical items done) |

Until stock and prices are in the system, POS will correctly refuse or show empty catalogues. That is normal — finish stock first.

---

## How GetAxe thinks (read once)

1. **Product master** = what the item is (name, SKU, units, batch/serial flags).  
   Creating a product does **not** put quantity in the warehouse.

2. **Stock** = quantity in a warehouse. Comes from:
   - **Opening stock** (stock you already had before GetAxe), or  
   - **Goods received (GRN)** against a purchase order, or  
   - Stock receive / adjustments (as allowed).

3. **Price** = what POS charges. Prefer:
   - Sell price on the product / default price list, or  
   - Category markup applied after average cost.

4. **Business type** (set at setup) controls which **starter kits** you see (pharmacy medicines vs hardware vs agrovet, etc.).

5. **Capabilities** (Settings) turn features on/off (batches, serials, pharmacy). Do not enable everything on day one unless you need it.

---

## Phase A — Account & first login (all businesses)

1. Receive invitation email / temporary password from GetAxe platform.
2. Open the app URL → **Login**.
3. If prompted, **change password** to one you will remember.
4. Complete **business setup** if not done (name, type, branch, warehouse).
5. Confirm **Settings → Business profile** shows the correct **business type**  
   (Pharmacy / Chemist / Hardware / Agrovet / Other / …).

**Checkpoint:** Dashboard opens without errors.

---

## Phase B — Foundation (all businesses) — do this before products

Work in this order:

### B1. Settings → Go-live readiness
Open **Settings → Go-live readiness**. Complete every required item, or use it as your checklist.

### B2. Branch & warehouse
- **Settings → Branches** — at least one branch (e.g. Main).
- **Settings → Warehouses** — at least one warehouse linked for stock (e.g. Main Warehouse).

### B3. Units
**Settings → Units** — ensure you have units you use, for example:

| Trade | Typical units |
|-------|----------------|
| Chemist | TAB, CAP, BOT, BOX, STRIP, PCS, VIAL |
| Hardware | PCS, BAG, KG, M, TON, BOX |
| Fish / food | KG, PCS, BOX, TRAY |
| Spares | PCS, SET, BOX |

Starter kits will try to create common units; still check they exist.

### B4. Cash & bank (tills)
**Finance → Cash & bank accounts** (or Settings path used for tills):

- Main cash drawer  
- M-Pesa / mobile money (if used)  
- Bank (if used)  
- Card terminal (if used)

**Existing business — opening cash:**  
Set **opening balances** for money you already held **before** first GetAxe sale (Finance / Opening balances).  
This keeps cash reports truthful.

### B5. Document numbering (recommended)
**Settings → Numbering** — cash sale vs invoice prefixes if you use both.

### B6. Users & roles (if staff will sell)
**Settings → Users / Roles** — cashier with POS rights; admin keeps full access.

**Checkpoint:** Branch, warehouse, units, and at least one cash till exist.

---

## Phase C — Products without typing everything

**Rule:** Prefer **bulk load**, then fix exceptions.

### C1. Choose your path by business type

#### Chemist / Pharmacy / Clinic
1. **Inventory → Pharmacy catalogues**
2. Load / confirm **default catalogues** (dosage forms, drug categories, etc.) if prompted.
3. Open **starter medicines** list.
4. Tick what you sell (or “select missing”) → **Add selected**.  
   This creates **product masters only** — still **no stock**.
5. Optional: **Import products** (Excel/CSV) for lines not in the starter list.

#### Hardware / building materials / electrical / paint
1. **Inventory → Starter kits**
2. You should see the **Hardware** kit (filtered by business type).
3. Select lines → **Add selected**.
4. Import Excel for extra SKUs.

#### Agrovet / farm supplies
1. **Inventory → Starter kits** → **Agrovet** kit.
2. Add selected → import extras if needed.

#### Motorbike / auto spare parts / garage
1. **Inventory → Starter kits** → **Motorbike** and/or **Auto**.
2. Complete **units** (whole bikes/3-wheelers) are marked **serialized** — you will enter chassis/engine serials when receiving stock.
3. Import Excel for brand-specific parts.

#### Fish depot / butchery / general retail / “Other”
1. **Inventory → Starter kits** may show **all industry kits** — only add what is relevant, **or skip kits**.
2. Best path: prepare an **Excel** with columns like:
   - name, sku, barcode, category, costPrice, sellingPrice, stockUnit, trackInventory  
3. **Inventory → Products → Import** (Excel/CSV).
4. For fish/meat: usually **KG** or **PCS**, inventory tracked, batches only if you use them.

### C2. Categories & markups (optional but powerful)
**Inventory → Categories**

- Create categories (Antibiotics, Fasteners, Fresh fish, …).
- Set **retail markup %** (and wholesale if you use it).  
  Example: cost 100, markup 30% → suggested sell 130 after receive/cost update.
- **Product prices** screen: confirm cost → markup → sell; apply where needed.

### C3. Product flags (only where true)
On product (or after import):

| Flag | Use when |
|------|----------|
| Track inventory | Almost always for goods you stock |
| Track batch / expiry | Medicines, chemicals, short-life foods |
| Serialized | Bikes, phones, high-value unique units — **not** ordinary tablets or nails |

**Checkpoint:** Products you will sell this week appear under **Inventory → Products** with a sell price path defined.

---

## Phase D — Put real quantities in the warehouse (critical)

Without this step, POS will say **no stock**.

### Option 1 — Opening stock (stock already in the shop before GetAxe)

1. Prepare Excel/CSV:  
   `sku`, `warehouse` (e.g. MAIN), `quantity`, `unit`, `unitCost`,  
   and if needed: `batchNumber`, `manufactureDate`, `expiryDate`,  
   `serialNumbers` (pipe `|` separated for serialized items).
2. Open **opening stock import** (from Stock / receive area as provided in the app).
3. Validate → fix errors (dates as YYYY-MM-DD, units that exist, product must exist first).
4. Receive once — **do not click receive twice**.

### Option 2 — Buy through the system (new purchases)

1. **Purchasing → Suppliers** — create supplier.  
2. **Purchase orders** — order in the **unit you buy** (box, kg, pcs); set cost **per that unit**.  
3. **Approve** PO.  
4. **Goods receiving (GRN)** — receive quantities; enter batch/expiry/serials if the product requires them.  
5. Confirm **supplier invoice / AP** and pay from the correct till when you pay the supplier.

**For existing stock, prefer Option 1.** Do not invent fake POs only to load old stock unless your accountant requires that path.

**Checkpoint:** **Inventory → Stock** shows quantities for items you will sell. Do a spot-check of 5 important SKUs.

---

## Phase E — Money truth (existing business)

1. Opening **cash** per till (already held money).  
2. Opening **stock** with **unit cost** (so stock value and profit make sense).  
3. Optional: record **opening supplier debt** / customer debt only if your finance path supports it; otherwise start clean and note balances offline for the first week.

**Checkpoint:** **Finance → Cash & bank** balances look realistic before first POS day.

---

## Phase F — First real sale test (mandatory)

1. Open **Sales → POS** (full screen).  
2. Select **warehouse** that has stock.  
3. Search / scan one product with stock.  
4. Confirm **unit** (pcs vs box) and **price** (retail default).  
5. Complete a small **Cash sale**.  
6. Verify:
   - Invoice / cash sale number appears under **Invoices**  
   - Stock reduced on **Stock**  
   - Payment appears on the correct till  
7. Optional: **credit sale** only after customer KYC / credit limit is set.

**Checkpoint:** One successful sale end-to-end = you are operationally ready.

---

## Phase G — Daily use after go-live

| Task | Where |
|------|--------|
| Sell | Sales → POS |
| Collect credit | Sales → Credit collections |
| Receive purchases | Purchasing → Orders → Receiving |
| Pay suppliers | Supplier invoices / Finance payments (choose **pay-from till**) |
| End of day | Finance → Daily reconciliation |
| See what needs attention | **Dashboard** (restock, expiry, debts, etc.) |
| Reports | Reports module (sales, stock, financial) |

---

## Vertical quick cards

### Chemist / pharmacy
1. Foundation (Phase B)  
2. Pharmacy catalogues + medicine starters  
3. Opening stock with **batch + expiry** where required  
4. FEFO / batch pick on POS when enabled  
5. Controlled medicines register if you use that capability  
6. Test sale  

### Hardware
1. Foundation  
2. Hardware starter kit + Excel for odd items  
3. Opening stock (bags, pcs, metres)  
4. Category markups  
5. Test sale  

### Agrovet
1. Foundation  
2. Agrovet starter kit  
3. Opening stock (bags of feed/fertilizer, bottles)  
4. Test sale  

### Fish depot / fresh food
1. Foundation  
2. Excel products (name, KG/PCS, cost, sell) — skip irrelevant starter kits  
3. Opening stock in **KG** or trays  
4. Prefer simple prices; use markup by category if helpful  
5. Test sale  
6. Plan daily wastage/adjustment process with manager  

### Spare parts / garage
1. Foundation  
2. Motorbike + auto starters  
3. Serialized **units** received with chassis/engine numbers  
4. Opening stock for fast-moving parts  
5. Test sale of a part + (optional) a unit  

---

## Common mistakes (avoid these)

| Mistake | Result | Do this instead |
|---------|--------|-----------------|
| Create products only, no opening stock/GRN | POS: no stock | Opening stock or GRN |
| Type 500 products by hand | Exhaustion | Starters + Excel |
| Wrong business type | Wrong starter kit | Fix type / use correct kit or Excel |
| Box factor = 1 when 1 box = 50 pcs | Stock multiplies wrong | Packaging: 1 box = N stock units |
| Sell before prices | Loss or cost as sell | Product prices / markup |
| Pay supplier without choosing till | Cash drawers wrong | Always select pay-from account |
| Double-click opening stock receive | Inflated stock | Receive once, close dialog |
| Enable every capability day one | Confusion | Enable only what you use |

---

## Final sign-off checklist (print and tick)

Business name: _________________  Date: ________

- [ ] Login works; password changed  
- [ ] Business type correct  
- [ ] Branch + warehouse  
- [ ] Units ready  
- [ ] Cash tills + opening cash (if any)  
- [ ] Products loaded (starter and/or Excel)  
- [ ] Prices OK on sample of 10 items  
- [ ] Stock on hand matches physical count for those 10 items  
- [ ] Test cash sale completed  
- [ ] Stock reduced after test sale  
- [ ] Cash till increased after test sale  
- [ ] Go-live readiness reviewed  
- [ ] Staff know: POS, receive, end-of-day recon  

**Signed (owner):** _____________  **Signed (GetAxe support):** _____________

When this list is complete, the business is **100% ready to start selling** on GetAxe for normal daily trade. Deeper features (full accounting polish, promotions, multi-branch) can follow after the first successful week.

---

## Getting help

- In-app **Dashboard** attention cards and **Business advisor** chat use live numbers.  
- Platform support can **Open for support** into your business to guide load of products and stock without you guessing menus.  
- Keep this manual with your staff SOP (`docs/STAFF_SOP.md`) at the till for daily habits after go-live.
