-- カードマスター挿入（user_id = 1）
INSERT INTO payment_cards (user_id, name, display_order) VALUES
(1, 'ジャックスカード', 1),
(1, '三井住友カード', 2),
(1, 'マルエツカード', 3),
(1, 'ウエルシアカード', 4),
(1, '楽天カード', 5),
(1, 'paypayカード', 6),
(1, 'amazonカード', 7),
(1, 'セブン銀行引き落とし', 8);

-- 銀行マスター挿入（user_id = 1）
INSERT INTO banks (user_id, name, display_order) VALUES
(1, '三井住友銀行', 1),
(1, 'セブン銀行', 2),
(1, 'paypay銀行', 3),
(1, '楽天銀行', 4),
(1, 'イオン銀行', 5);

-- 月次レコード挿入（2025年7月〜12月）
INSERT INTO monthly_records (user_id, year_month, expected_income) VALUES
(1, '2025-07', 210000),
(1, '2025-08', 240000),
(1, '2025-09', 247000),
(1, '2025-10', 220000),
(1, '2025-11', 220000),
(1, '2025-12', 0);

-- カード支払い（2025年7月）monthly_record_id=1
INSERT INTO monthly_card_payments (monthly_record_id, card_id, amount) VALUES
(1, 1, 69000), -- ジャックス
(1, 2, 31387), -- 三井住友
(1, 3, 9799),  -- マルエツ
(1, 4, 2893),  -- ウエルシア
(1, 5, 42495), -- 楽天
(1, 6, 39906), -- paypay
(1, 7, 16118), -- amazon
(1, 8, 25000); -- セブン引落

-- カード支払い（2025年8月）monthly_record_id=2
INSERT INTO monthly_card_payments (monthly_record_id, card_id, amount) VALUES
(2, 1, 49143),
(2, 2, 27776),
(2, 3, 34445),
(2, 4, 18735),
(2, 5, 14917),
(2, 6, 33000),
(2, 7, 33039),
(2, 8, 24000);

-- カード支払い（2025年9月）monthly_record_id=3
INSERT INTO monthly_card_payments (monthly_record_id, card_id, amount) VALUES
(3, 1, 50020),
(3, 2, 23599),
(3, 3, 8702),
(3, 4, 9538),
(3, 5, 76217),
(3, 6, 42421),
(3, 7, 60790),
(3, 8, 6239);

-- カード支払い（2025年10月）monthly_record_id=4
INSERT INTO monthly_card_payments (monthly_record_id, card_id, amount) VALUES
(4, 1, 58180),
(4, 2, 23028),
(4, 3, 8702),
(4, 4, 10000),
(4, 5, 66795),
(4, 6, 87976),
(4, 7, 6663),
(4, 8, 6239);

-- カード支払い（2025年11月）monthly_record_id=5
INSERT INTO monthly_card_payments (monthly_record_id, card_id, amount) VALUES
(5, 1, 64780),
(5, 2, 23055),
(5, 3, 11377),
(5, 4, 11572),
(5, 5, 53443),
(5, 6, 44794),
(5, 7, 3022),
(5, 8, 6329);

-- 銀行支払い（2025年7月）
INSERT INTO monthly_bank_payments (monthly_record_id, bank_id, amount) VALUES
(1, 1, 100387), -- 三井住友
(1, 2, 41118),  -- セブン
(1, 3, 39906),  -- paypay
(1, 4, 42495),  -- 楽天
(1, 5, 12692);  -- イオン

-- 銀行支払い（2025年8月）
INSERT INTO monthly_bank_payments (monthly_record_id, bank_id, amount) VALUES
(2, 1, 109958),
(2, 2, 24000),
(2, 3, 33000),
(2, 4, 14917),
(2, 5, 53180);

-- 銀行支払い（2025年9月）
INSERT INTO monthly_bank_payments (monthly_record_id, bank_id, amount) VALUES
(3, 1, 134409),
(3, 2, 6239),
(3, 3, 42421),
(3, 4, 76217),
(3, 5, 18240);

-- 銀行支払い（2025年10月）
INSERT INTO monthly_bank_payments (monthly_record_id, bank_id, amount) VALUES
(4, 1, 87871),
(4, 2, 6239),
(4, 3, 87976),
(4, 4, 66795),
(4, 5, 18702);

-- 銀行支払い（2025年11月）
INSERT INTO monthly_bank_payments (monthly_record_id, bank_id, amount) VALUES
(5, 1, 90857),
(5, 2, 6329),
(5, 3, 44794),
(5, 4, 53443),
(5, 5, 22949);

-- 銀行残高（2025年7月）
INSERT INTO monthly_bank_balances (monthly_record_id, bank_id, balance) VALUES
(1, 1, 85000),
(1, 2, 4000),
(1, 3, 9135),
(1, 4, 44000),
(1, 5, 4000);

-- 銀行残高（2025年8月）
INSERT INTO monthly_bank_balances (monthly_record_id, bank_id, balance) VALUES
(2, 1, 10195),
(2, 2, 7735),
(2, 3, 9231),
(2, 4, 2115),
(2, 5, 11822);

-- 銀行残高（2025年9月）
INSERT INTO monthly_bank_balances (monthly_record_id, bank_id, balance) VALUES
(3, 1, 25925),
(3, 2, 6000),
(3, 3, 12201),
(3, 4, 7198),
(3, 5, 10000);

-- 銀行残高（2025年10月）
INSERT INTO monthly_bank_balances (monthly_record_id, bank_id, balance) VALUES
(4, 1, 16191),
(4, 2, 6000),
(4, 3, 68571),
(4, 4, 4357),
(4, 5, 5414);

-- 銀行残高（2025年11月）
INSERT INTO monthly_bank_balances (monthly_record_id, bank_id, balance) VALUES
(5, 1, 19320),
(5, 2, 6000),
(5, 3, 10604),
(5, 4, 7502),
(5, 5, 5285);

-- 相殺負担金額（2025年7月）
INSERT INTO monthly_net_payments (monthly_record_id, bank_id, amount) VALUES
(1, 1, 15387),
(1, 2, 37118),
(1, 3, 30771),
(1, 4, -1505),
(1, 5, 8692);

-- 相殺負担金額（2025年8月）
INSERT INTO monthly_net_payments (monthly_record_id, bank_id, amount) VALUES
(2, 1, 99763),
(2, 2, 16265),
(2, 3, 23769),
(2, 4, 12802),
(2, 5, 41358);

-- 相殺負担金額（2025年9月）
INSERT INTO monthly_net_payments (monthly_record_id, bank_id, amount) VALUES
(3, 1, 108484),
(3, 2, 239),
(3, 3, 30220),
(3, 4, 69019),
(3, 5, 8240);

-- 相殺負担金額（2025年10月）
INSERT INTO monthly_net_payments (monthly_record_id, bank_id, amount) VALUES
(4, 1, 71680),
(4, 2, 239),
(4, 3, 19405),
(4, 4, 62438),
(4, 5, 13288);

-- 相殺負担金額（2025年11月）
INSERT INTO monthly_net_payments (monthly_record_id, bank_id, amount) VALUES
(5, 1, 71537),
(5, 2, 329),
(5, 3, 34190),
(5, 4, 45941),
(5, 5, 17664);
