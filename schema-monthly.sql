-- 月次データテーブル（年月ごとのマスター）
CREATE TABLE IF NOT EXISTS monthly_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    year_month TEXT NOT NULL, -- 'YYYY-MM' 形式
    expected_income INTEGER DEFAULT 0, -- 手取り予想
    notes TEXT DEFAULT '', -- 反省・教訓メモ
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, year_month)
);

-- カード支払いマスター（動的に追加可能）
CREATE TABLE IF NOT EXISTS payment_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

-- 銀行マスター（動的に追加可能）
CREATE TABLE IF NOT EXISTS banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

-- カード別月次支払金額
CREATE TABLE IF NOT EXISTS monthly_card_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monthly_record_id INTEGER NOT NULL,
    card_id INTEGER NOT NULL,
    amount INTEGER DEFAULT 0,
    FOREIGN KEY (monthly_record_id) REFERENCES monthly_records(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES payment_cards(id) ON DELETE CASCADE,
    UNIQUE(monthly_record_id, card_id)
);

-- 銀行別月次支払金額
CREATE TABLE IF NOT EXISTS monthly_bank_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monthly_record_id INTEGER NOT NULL,
    bank_id INTEGER NOT NULL,
    amount INTEGER DEFAULT 0,
    FOREIGN KEY (monthly_record_id) REFERENCES monthly_records(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE,
    UNIQUE(monthly_record_id, bank_id)
);

-- 銀行別月次残高
CREATE TABLE IF NOT EXISTS monthly_bank_balances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monthly_record_id INTEGER NOT NULL,
    bank_id INTEGER NOT NULL,
    balance INTEGER DEFAULT 0,
    FOREIGN KEY (monthly_record_id) REFERENCES monthly_records(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE,
    UNIQUE(monthly_record_id, bank_id)
);

-- 銀行別月次相殺負担金額
CREATE TABLE IF NOT EXISTS monthly_net_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monthly_record_id INTEGER NOT NULL,
    bank_id INTEGER NOT NULL,
    amount INTEGER DEFAULT 0,
    FOREIGN KEY (monthly_record_id) REFERENCES monthly_records(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE,
    UNIQUE(monthly_record_id, bank_id)
);
