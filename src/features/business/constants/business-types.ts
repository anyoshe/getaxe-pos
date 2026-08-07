export const BUSINESS_TYPES = [
  {
    value: "GENERAL_RETAIL",
    label: "General Retail Shop",
  },
  {
    value: "SUPERMARKET",
    label: "Supermarket",
  },
  {
    value: "MINI_MARKET",
    label: "Mini Market",
  },
  {
    value: "WHOLESALE",
    label: "Wholesale Shop",
  },

  {
    value: "HARDWARE",
    label: "Hardware Store",
  },
  {
    value: "ELECTRICAL",
    label: "Electrical Shop",
  },
  {
    value: "ELECTRONICS",
    label: "Electronics Shop",
  },
  {
    value: "PLUMBING",
    label: "Plumbing Shop",
  },
  {
    value: "BUILDING_MATERIALS",
    label: "Building Materials",
  },
  {
    value: "PAINT",
    label: "Paint Shop",
  },

  {
    value: "PHARMACY",
    label: "Pharmacy",
  },
  {
    value: "CHEMIST",
    label: "Chemist",
  },
  {
    value: "CLINIC",
    label: "Clinic",
  },
  {
    value: "HOSPITAL",
    label: "Hospital",
  },
  {
    value: "LABORATORY",
    label: "Laboratory",
  },
  {
    value: "OPTICAL",
    label: "Optical Shop",
  },

  {
    value: "RESTAURANT",
    label: "Restaurant",
  },
  {
    value: "CAFE",
    label: "Cafe",
  },
  {
    value: "HOTEL",
    label: "Hotel",
  },
  {
    value: "BAR",
    label: "Bar",
  },
  {
    value: "BAKERY",
    label: "Bakery",
  },
  {
    value: "BUTCHERY",
    label: "Butchery",
  },

  {
    value: "BOUTIQUE",
    label: "Boutique",
  },
  {
    value: "CLOTHING",
    label: "Clothing Store",
  },
  {
    value: "SHOES",
    label: "Shoe Store",
  },

  {
    value: "GARAGE",
    label: "Garage",
  },
  {
    value: "SPARE_PARTS",
    label: "Spare Parts",
  },
  {
    value: "TYRE_CENTER",
    label: "Tyre Centre",
  },

  {
    value: "AGROVET",
    label: "Agrovet",
  },
  {
    value: "FARM_SUPPLIES",
    label: "Farm Supplies",
  },

  {
    value: "BOOKSHOP",
    label: "Bookshop",
  },
  {
    value: "STATIONERY",
    label: "Stationery",
  },
  {
    value: "PRINTING",
    label: "Printing Shop",
  },

  {
    value: "MANUFACTURER",
    label: "Manufacturer",
  },
  {
    value: "DISTRIBUTOR",
    label: "Distributor",
  },

  {
    value: "OTHER",
    label: "Other",
  },
] as const;

export type BusinessType =
  (typeof BUSINESS_TYPES)[number]["value"];

export const BUSINESS_TYPE_VALUES =
  BUSINESS_TYPES.map(
    (type) => type.value,
  ) as [
    BusinessType,
    ...BusinessType[],
  ];