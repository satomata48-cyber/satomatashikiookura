-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- セッションテーブル
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- カテゴリテーブル
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT,
    color TEXT
);

-- 収支テーブル
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 資産種別テーブル
CREATE TABLE IF NOT EXISTS asset_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cash', 'investment'))
);

-- 資産テーブル
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    asset_type_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_type_id) REFERENCES asset_types(id)
);

-- 資産履歴テーブル（月次スナップショット）
CREATE TABLE IF NOT EXISTS asset_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    recorded_at TEXT NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- デフォルトカテゴリ挿入
INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES
(1, '給与', 'income', '💰', '#22c55e'),
(2, '副収入', 'income', '💵', '#10b981'),
(3, '投資収益', 'income', '📈', '#14b8a6'),
(4, 'その他収入', 'income', '➕', '#06b6d4'),
(5, '食費', 'expense', '🍽️', '#ef4444'),
(6, '光熱費', 'expense', '💡', '#f97316'),
(7, '通信費', 'expense', '📱', '#f59e0b'),
(8, '交通費', 'expense', '🚃', '#eab308'),
(9, '住居費', 'expense', '🏠', '#84cc16'),
(10, '医療費', 'expense', '🏥', '#22c55e'),
(11, '娯楽費', 'expense', '🎮', '#06b6d4'),
(12, '衣服費', 'expense', '👕', '#3b82f6'),
(13, '教育費', 'expense', '📚', '#6366f1'),
(14, 'その他支出', 'expense', '➖', '#8b5cf6');

-- デフォルト資産種別挿入
INSERT OR IGNORE INTO asset_types (id, name, category) VALUES
(1, '普通預金', 'cash'),
(2, '定期預金', 'cash'),
(3, '現金', 'cash'),
(4, '株式', 'investment'),
(5, '投資信託', 'investment'),
(6, '暗号資産', 'investment'),
(7, '債券', 'investment'),
(8, 'その他投資', 'investment');

-- ゴールド資産テーブル（数量g×日本円単価で計算）
CREATE TABLE IF NOT EXISTS gold_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_record_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    jpy_price REAL NOT NULL DEFAULT 0,
    memo TEXT,
    FOREIGN KEY (asset_record_id) REFERENCES asset_records(id) ON DELETE CASCADE
);

-- ドキュメントテーブル（Notion風）
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL DEFAULT '無題',
    content TEXT NOT NULL DEFAULT '',
    emoji TEXT DEFAULT '📄',
    parent_id INTEGER,
    is_folder INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES documents(id) ON DELETE CASCADE
);
