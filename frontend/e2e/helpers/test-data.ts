export const TEST_USERS = {
  default: {
    email: "testuser@example.com",
    password: "Test@123",
    fullName: "Ganesh Sutar",
  },
} as const;

export const AUTH_ROUTES = {
  login: "/auth/login",
  register: "/auth/register",
  dashboard: "/app/dashboard",
} as const;

export const SYSTEM_ROUTES = {
  settings: "/app/system/settings",
} as const;

export const ACCOUNTING_ROUTES = {
  partyLedger: "/app/accounts/party-ledger",
  chartOfAccounts: "/app/accounts/chart-of-accounts",
  vouchers: "/app/accounts/vouchers",
  newVoucher: "/app/accounts/vouchers/new",
  daybook: "/app/accounts/daybook",
  interest: "/app/accounts/interest",
} as const;

// --- Mock Data Factories ---

export const MOCK_ACCOUNTS_SUMMARY = {
  total_debtors: 245000,
  total_creditors: 180000,
  todays_receipts: 35000,
  pending_interest: 12500,
};

export const MOCK_PARTY_ACCOUNTS = [
  {
    id: "party-1",
    code: "5001",
    name: "Ram Singh",
    account_type: "ACCOUNT",
    closing_balance: "50000.00",
    balance_nature: "DEBIT",
    phone: "9876543210",
    village: "Jhajjar",
    address: "Main Road, Jhajjar",
    dr_limit: 100000,
    component_balances: { rent: 30000, loan: 15000, bardana: 5000 },
  },
  {
    id: "party-2",
    code: "5002",
    name: "Shyam Kumar",
    account_type: "ACCOUNT",
    closing_balance: "25000.00",
    balance_nature: "CREDIT",
    phone: "9876543211",
    village: "Rohtak",
    address: "Station Road, Rohtak",
    dr_limit: 50000,
    component_balances: { rent: 20000, loan: 5000 },
  },
  {
    id: "party-3",
    code: "5003",
    name: "Mohan Lal",
    account_type: "ACCOUNT",
    closing_balance: "0.00",
    balance_nature: "DEBIT",
    phone: "",
    village: "",
    address: "",
    dr_limit: 0,
    component_balances: {},
  },
];

export const MOCK_ACCOUNT_TREE = [
  {
    id: "grp-assets",
    code: "1000",
    name: "Assets",
    account_type: "GROUP",
    closing_balance: "500000.00",
    balance_nature: "DEBIT",
    children: [
      {
        id: "acc-cash",
        code: "1001",
        name: "Cash in Hand",
        account_type: "ACCOUNT",
        closing_balance: "125000.00",
        balance_nature: "DEBIT",
        children: [],
      },
      {
        id: "acc-bank",
        code: "1002",
        name: "Bank Account",
        account_type: "ACCOUNT",
        closing_balance: "375000.00",
        balance_nature: "DEBIT",
        children: [],
      },
    ],
  },
  {
    id: "grp-liabilities",
    code: "2000",
    name: "Liabilities",
    account_type: "GROUP",
    closing_balance: "200000.00",
    balance_nature: "CREDIT",
    children: [
      {
        id: "grp-parties",
        code: "2100",
        name: "Party Accounts",
        account_type: "GROUP",
        closing_balance: "200000.00",
        balance_nature: "CREDIT",
        children: [],
      },
    ],
  },
];

export const MOCK_FLAT_ACCOUNTS = [
  { id: "acc-cash", code: "1001", name: "Cash in Hand", account_type: "ACCOUNT", party_type: null },
  { id: "acc-bank", code: "1002", name: "Bank Account", account_type: "ACCOUNT", party_type: null },
  { id: "grp-assets", code: "1000", name: "Assets", account_type: "GROUP", party_type: null },
  { id: "grp-parties", code: "2100", name: "Party Accounts", account_type: "GROUP", party_type: null },
  { id: "party-1", code: "5001", name: "Ram Singh", account_type: "ACCOUNT", party_type: "farmer" },
];

export const MOCK_VOUCHERS = [
  {
    id: "v-1",
    voucher_no: "CR/2025-00001",
    voucher_type: "CR",
    date: "2025-01-15",
    total_debit: 10000,
    total_credit: 10000,
    narration: "Cash received from Ram Singh",
    lines: [
      { account_id: "acc-cash", account_name: "Cash in Hand", debit: 10000, credit: null },
      { account_id: "party-1", account_name: "Ram Singh", debit: null, credit: 10000 },
    ],
  },
  {
    id: "v-2",
    voucher_no: "DR/2025-00001",
    voucher_type: "DR",
    date: "2025-01-15",
    total_debit: 5000,
    total_credit: 5000,
    narration: "Payment to Shyam Kumar",
    lines: [
      { account_id: "party-2", account_name: "Shyam Kumar", debit: 5000, credit: null },
      { account_id: "acc-cash", account_name: "Cash in Hand", debit: null, credit: 5000 },
    ],
  },
  {
    id: "v-3",
    voucher_no: "JV/2025-00001",
    voucher_type: "JV",
    date: "2025-01-16",
    total_debit: 2000,
    total_credit: 2000,
    narration: "Journal entry for adjustment",
    lines: [
      { account_id: "party-1", account_name: "Ram Singh", debit: 2000, credit: null },
      { account_id: "party-2", account_name: "Shyam Kumar", debit: null, credit: 2000 },
    ],
  },
];

export const MOCK_DAYBOOK_SUMMARY = {
  is_closed: false,
  cash: { opening: 100000, receipts: 35000, payments: 15000, closing: 120000 },
  bank: { opening: 250000, receipts: 50000, payments: 20000, closing: 280000 },
};

export const MOCK_DAYBOOK_TRANSACTIONS = [
  {
    id: "dt-1",
    voucher_no: "CR/2025-00001",
    voucher_type: "CR" as const,
    debit_account: "Cash in Hand",
    credit_account: "Ram Singh",
    amount: 10000,
    time: "09:30",
  },
  {
    id: "dt-2",
    voucher_no: "DR/2025-00001",
    voucher_type: "DR" as const,
    debit_account: "Shyam Kumar",
    credit_account: "Cash in Hand",
    amount: 5000,
    time: "10:15",
  },
  {
    id: "dt-3",
    voucher_no: "JV/2025-00001",
    voucher_type: "JV" as const,
    debit_account: "Ram Singh",
    credit_account: "Shyam Kumar",
    amount: 2000,
    time: "11:00",
  },
];

export const MOCK_INTEREST_RESULT = {
  calculated_at: "2025-01-31T12:00:00Z",
  total_principal: 75000,
  total_interest: 1125,
  results: [
    {
      party_id: "party-1",
      party_name: "Ram Singh",
      principal: 50000,
      days: 30,
      rate: 1.5,
      interest: 750,
      breakdown: [
        { component: "rent" as const, principal: 30000, interest: 450 },
        { component: "loan" as const, principal: 15000, interest: 225 },
        { component: "bardana" as const, principal: 5000, interest: 75 },
      ],
    },
    {
      party_id: "party-2",
      party_name: "Shyam Kumar",
      principal: 25000,
      days: 30,
      rate: 1.5,
      interest: 375,
      breakdown: [
        { component: "rent" as const, principal: 20000, interest: 300 },
        { component: "loan" as const, principal: 5000, interest: 75 },
      ],
    },
  ],
};

export const MOCK_LEDGER_ENTRIES = [
  { id: "le-1", date: "2025-01-10", voucher_no: "CR/2025-00001", debit: 10000, credit: null },
  { id: "le-2", date: "2025-01-12", voucher_no: "JV/2025-00001", debit: null, credit: 2000 },
  { id: "le-3", date: "2025-01-15", voucher_no: "DR/2025-00002", debit: null, credit: 5000 },
];

export const MOCK_NEXT_NUMBER = { next_number: "CR/2025-00002" };

export const INVENTORY_ROUTES = {
  amad: "/app/inventory/amad",
  newAmad: "/app/inventory/amad/new",
  nikasi: "/app/inventory/nikasi",
  newNikasi: "/app/inventory/nikasi/new",
  takpatti: "/app/inventory/takpatti",
  stockTransfer: "/app/inventory/stock-transfer",
} as const;

export const MOCK_COMMODITIES = [
  {
    id: "comm-1",
    code: "WHT",
    name: "Wheat",
    variety: "Sharbati",
    is_active: true,
    grace_days: 15,
    default_rent_rate: 12.5,
  },
  {
    id: "comm-2",
    code: "RCE",
    name: "Rice",
    variety: "Basmati",
    is_active: true,
    grace_days: 10,
    default_rent_rate: 15.0,
  },
  {
    id: "comm-3",
    code: "MST",
    name: "Mustard",
    variety: null,
    is_active: false,
    grace_days: 7,
    default_rent_rate: 10.0,
  },
];

export const MOCK_ROOMS = [
  { id: "room-1", number: 1, name: "Main Store", is_active: true, capacity: 5000 },
  { id: "room-2", number: 2, name: "Cold Room", is_active: true, capacity: 3000 },
];

export const MOCK_VILLAGES = [
  { id: "village-1", code: "JHJ", name: "Jhajjar", is_active: true },
  { id: "village-2", code: "RHT", name: "Rohtak", is_active: true },
];

export const MOCK_STOCK_SUMMARY = {
  total_amads: 25,
  active_amads: 18,
  fully_dispatched: 7,
  remaining_packets: 5200,
  remaining_weight: 260000,
  total_weight: 350000,
};

export const MOCK_TODAY_SUMMARY = {
  arrivals: { count: 3, packets: 150, weight: 7500 },
  dispatches: { count: 2, packets: 80, weight: 4000 },
};

export const MOCK_AMADS = [
  {
    id: "amad-1",
    amad_no: "KB/2025-00001",
    date: "2025-01-10",
    party: "party-1",
    party_name: "Ram Singh",
    party_code: "5001",
    commodity: "comm-1",
    commodity_name: "Wheat",
    room: "room-1",
    room_number: 1,
    amad_type: "SEEDHI",
    total_packets: 100,
    total_weight: 5000,
    remaining_packets: 60,
    remaining_weight: 3000,
    is_fully_dispatched: false,
  },
  {
    id: "amad-2",
    amad_no: "KB/2025-00002",
    date: "2025-01-12",
    party: "party-2",
    party_name: "Shyam Kumar",
    party_code: "5002",
    commodity: "comm-2",
    commodity_name: "Rice",
    room: "room-2",
    room_number: 2,
    amad_type: "DUMP",
    total_packets: 50,
    total_weight: 2500,
    remaining_packets: 50,
    remaining_weight: 2500,
    is_fully_dispatched: false,
  },
  {
    id: "amad-3",
    amad_no: "KB/2025-00003",
    date: "2025-01-08",
    party: "party-1",
    party_name: "Ram Singh",
    party_code: "5001",
    commodity: "comm-1",
    commodity_name: "Wheat",
    room: "room-1",
    room_number: 1,
    amad_type: "SEEDHI",
    total_packets: 80,
    total_weight: 4000,
    remaining_packets: 0,
    remaining_weight: 0,
    is_fully_dispatched: true,
  },
];

export const MOCK_RENTS = [
  {
    id: "rent-1",
    serial_no: "NK/2025-00001",
    date: "2025-01-20",
    party: "party-1",
    party_name: "Ram Singh",
    party_code: "5001",
    amad: "amad-1",
    amad_no: "KB/2025-00001",
    commodity_name: "Wheat",
    nikasi_type: "SEEDHI" as const,
    packets: 40,
    weight: 2000,
    storage_days: 10,
    rent_rate: 12.5,
    rent_amount: 833.33,
    gst_percent: 18,
    gst_amount: 150,
    total_amount: 983.33,
  },
  {
    id: "rent-2",
    serial_no: "NK/2025-00002",
    date: "2025-01-22",
    party: "party-2",
    party_name: "Shyam Kumar",
    party_code: "5002",
    amad: "amad-2",
    amad_no: "KB/2025-00002",
    commodity_name: "Rice",
    nikasi_type: "KATAI" as const,
    packets: 20,
    weight: 1000,
    storage_days: 10,
    rent_rate: 15.0,
    rent_amount: 500,
    gst_percent: 18,
    gst_amount: 90,
    total_amount: 590,
  },
];

export const MOCK_RENT_CALCULATION = {
  amad_no: "KB/2025-00001",
  amad_date: "2025-01-10",
  dispatch_date: "2025-01-20",
  packets: 40,
  weight: 2000,
  weight_quintals: 20.0,
  storage_days: 10,
  grace_days: 15,
  billable_days: 0,
  rent_rate: 12.5,
  rent_amount: 833.33,
  gst_percent: 18,
  gst_amount: 150,
  total_amount: 983.33,
};

export const MOCK_TAKPATTIS = [
  {
    id: "tkp-1",
    takpatti_no: "TP/2025-00001",
    date: "2025-01-10",
    amad: "amad-1",
    amad_no: "KB/2025-00001",
    party_name: "Ram Singh",
    packets: 50,
    gross_weight: 2600,
    tare_weight: 100,
    net_weight: 2500,
    room: "room-1",
    room_number: 1,
    floor_no: 1,
  },
  {
    id: "tkp-2",
    takpatti_no: "TP/2025-00002",
    date: "2025-01-12",
    amad: "amad-2",
    amad_no: "KB/2025-00002",
    party_name: "Shyam Kumar",
    packets: 50,
    gross_weight: 2550,
    tare_weight: 50,
    net_weight: 2500,
    room: "room-2",
    room_number: 2,
    floor_no: 2,
  },
];
