"""
Seed data constants for initializing a new organization.

All data is ordered so that parent records come before children.
Each entry uses the `code` field as the idempotency key (unique per organization).
"""

from decimal import Decimal

# =============================================================================
# Chart of Accounts
# =============================================================================
# Each entry: code, name, account_type (GROUP/ACCOUNT), balance_nature (DEBIT/CREDIT), parent_code
# Ordered parents-before-children so parents are always created first.

CHART_OF_ACCOUNTS = [
    # Level 0 — Root groups
    {"code": "1", "name": "CURRENT ASSESTS", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": None},
    {"code": "2", "name": "LOAN LIABILITIES", "account_type": "GROUP", "balance_nature": "CREDIT", "parent_code": None},
    {"code": "3", "name": "FIXED ASSESTS", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": None},
    {"code": "4", "name": "CURRENT LIABILITIES", "account_type": "GROUP", "balance_nature": "CREDIT", "parent_code": None},
    {"code": "5", "name": "REVENUE ACCOUNT", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": None},
    {"code": "6", "name": "CAPITAL ACCOUNT", "account_type": "GROUP", "balance_nature": "CREDIT", "parent_code": None},
    # Level 1 — Under CURRENT ASSESTS (1)
    {"code": "8", "name": "CASH & BANK ACCOUNTS", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "1"},
    {"code": "9", "name": "SUNDRY DEBTERS", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "1"},
    {"code": "10", "name": "STOCK IN HAND", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "1"},
    {"code": "30", "name": "MOVABLE ASSETS", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "1"},
    {"code": "35", "name": "ICE DEALERS", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "1"},
    {"code": "36", "name": "FARMER", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "1"},
    # Level 1 — Under CURRENT LIABILITIES (4)
    {"code": "12", "name": "SECURED LOAN", "account_type": "GROUP", "balance_nature": "CREDIT", "parent_code": "4"},
    {"code": "13", "name": "UNSECURED LOAN", "account_type": "GROUP", "balance_nature": "CREDIT", "parent_code": "4"},
    {"code": "19", "name": "DUTIES AND TAXES", "account_type": "GROUP", "balance_nature": "CREDIT", "parent_code": "4"},
    {"code": "20", "name": "SUNDRY CREDITERS", "account_type": "GROUP", "balance_nature": "CREDIT", "parent_code": "4"},
    {"code": "21", "name": "STAFF", "account_type": "GROUP", "balance_nature": "CREDIT", "parent_code": "4"},
    # Level 1 — Under FIXED ASSESTS (3)
    {"code": "15", "name": "PLANT AND MACHIENRY ACCOUNT", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "3"},
    {"code": "16", "name": "FURNITURE ACCOUNT", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "3"},
    {"code": "18", "name": "OFFICE EQUIPMENT", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "3"},
    # Level 2 — Under MOVABLE ASSETS (30)
    {"code": "17", "name": "VEHICLES", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "30"},
    # Level 1 — Under REVENUE ACCOUNT (5)
    {"code": "22", "name": "PURCHASE A/C", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "5"},
    {"code": "23", "name": "INDIRECT EXPENCES", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "5"},
    {"code": "24", "name": "DIRECT EXPENCES", "account_type": "GROUP", "balance_nature": "DEBIT", "parent_code": "5"},
    {"code": "25", "name": "SALE A/C", "account_type": "GROUP", "balance_nature": "CREDIT", "parent_code": "5"},
    {"code": "26", "name": "INCOME FROM OTHER RESOURCES", "account_type": "GROUP", "balance_nature": "CREDIT", "parent_code": "5"},
    # Leaf accounts — Under SALE A/C (25)
    {"code": "37", "name": "RENT A/C", "account_type": "ACCOUNT", "balance_nature": "CREDIT", "parent_code": "25"},
    {"code": "38", "name": "BARDANA A/C", "account_type": "ACCOUNT", "balance_nature": "CREDIT", "parent_code": "25"},
    {"code": "41", "name": "INTEREST A/C", "account_type": "ACCOUNT", "balance_nature": "CREDIT", "parent_code": "25"},
    {"code": "46", "name": "ICE SALE A/C", "account_type": "ACCOUNT", "balance_nature": "CREDIT", "parent_code": "25"},
    {"code": "48", "name": "MILK SALE A/C", "account_type": "ACCOUNT", "balance_nature": "CREDIT", "parent_code": "25"},
    # Leaf accounts — Under DIRECT EXPENCES (24)
    {"code": "27", "name": "LOADING CHARGES A/C.", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "24"},
    {"code": "28", "name": "UNLOADING CHARGES A/C.", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "24"},
    {"code": "31", "name": "DUMP CHARGES A/C.", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "24"},
    {"code": "42", "name": "DALA/PALLEDARI A/C", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "24"},
    {"code": "43", "name": "KATAI A/C", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "24"},
    {"code": "44", "name": "KANTA/KATAI/RENT A/C", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "24"},
    {"code": "50", "name": "PALTAI/SHIFTING A/C", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "24"},
    {"code": "51", "name": "COLD STORAGE EXPENSES (MISC)", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "24"},
    # Leaf accounts — Under INDIRECT EXPENCES (23)
    {"code": "14", "name": "INSURANCE A/C", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "23"},
    # Leaf accounts — Under CASH & BANK ACCOUNTS (8)
    {"code": "29", "name": "CASH A/C", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "8"},
    # Leaf accounts — Under STOCK IN HAND (10)
    {"code": "32", "name": "CLOSING STOCK", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "10"},
    {"code": "34", "name": "OPENING STOCK", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "10"},
    # Leaf accounts — Under STAFF (21)
    {"code": "33", "name": "STAFF SALARY PAYABLE", "account_type": "ACCOUNT", "balance_nature": "CREDIT", "parent_code": "21"},
    # Leaf accounts — Under SUNDRY CREDITERS (20)
    {"code": "49", "name": "ADVANCE FROM FARMERS", "account_type": "ACCOUNT", "balance_nature": "CREDIT", "parent_code": "20"},
    # Leaf accounts — Under REVENUE ACCOUNT (5) directly
    {"code": "11", "name": "RENT WAPSI A/C", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "5"},
    {"code": "39", "name": "PAYMENT REALISATION A/C", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "5"},
    {"code": "40", "name": "DUE A/C", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "5"},
    {"code": "45", "name": "DISCOUNT A/C", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "5"},
    {"code": "47", "name": "REBATE AND SHORT REALISATION", "account_type": "ACCOUNT", "balance_nature": "DEBIT", "parent_code": "5"},
]

# =============================================================================
# Banks (38 Indian banks)
# =============================================================================

BANKS = [
    {"code": "1", "name": "Allahabad Bank"},
    {"code": "2", "name": "Andhra Bank"},
    {"code": "3", "name": "Axis Bank"},
    {"code": "4", "name": "Bandhan Bank"},
    {"code": "5", "name": "Bank of Baroda"},
    {"code": "6", "name": "Bank of India"},
    {"code": "7", "name": "Bank of Maharashtra"},
    {"code": "8", "name": "Bharatiya Mahila Bank"},
    {"code": "9", "name": "Canara Bank"},
    {"code": "10", "name": "Central Bank of India"},
    {"code": "11", "name": "Corporation Bank"},
    {"code": "12", "name": "Dena Bank"},
    {"code": "13", "name": "HDFC Bank"},
    {"code": "14", "name": "ICICI Bank"},
    {"code": "15", "name": "IDBI Bank"},
    {"code": "16", "name": "Indian Bank"},
    {"code": "17", "name": "IndusInd Bank"},
    {"code": "18", "name": "Jammu and Kashmir Bank"},
    {"code": "19", "name": "Karnataka Bank"},
    {"code": "20", "name": "Kotak Mahindra Bank"},
    {"code": "21", "name": "Nainital Bank"},
    {"code": "22", "name": "Oriental Bank of Commerce"},
    {"code": "23", "name": "Punjab & Sindh Bank"},
    {"code": "24", "name": "Punjab National Bank"},
    {"code": "25", "name": "South Indian Bank"},
    {"code": "26", "name": "State Bank of Bikaner and Jaipur"},
    {"code": "27", "name": "State Bank of Hyderabad"},
    {"code": "28", "name": "State Bank of India"},
    {"code": "29", "name": "State Bank of Mysore"},
    {"code": "30", "name": "State Bank of Patiala"},
    {"code": "31", "name": "State Bank of Sikkim"},
    {"code": "32", "name": "State Bank of Travancore"},
    {"code": "33", "name": "Syndicate Bank"},
    {"code": "34", "name": "UCO Bank"},
    {"code": "35", "name": "Union Bank of India"},
    {"code": "36", "name": "United Bank of India"},
    {"code": "37", "name": "Vijaya Bank"},
    {"code": "38", "name": "Yes Bank"},
]

# =============================================================================
# Bardana Types
# =============================================================================

BARDANA_TYPES = [
    {"code": "1", "name": "A", "rate_per_unit": Decimal("0.00")},
]

# =============================================================================
# Commodities
# =============================================================================

COMMODITIES = [
    {"code": "1", "name": "POTATO", "default_rent_rate": Decimal("62.50")},
]
