import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return { incomeData: [], assetData: [] };
	}

	const userId = locals.user.id;

	// 収支データを取得
	const monthlyRecords = await db.prepare(`
		SELECT
			mr.id,
			mr.year_month,
			mr.expected_income,
			mr.notes
		FROM monthly_records mr
		WHERE mr.user_id = ?
		ORDER BY mr.year_month ASC
	`).bind(userId).all<{
		id: number;
		year_month: string;
		expected_income: number;
		notes: string | null;
	}>();

	const incomeData = await Promise.all(
		monthlyRecords.results.map(async (record) => {
			// カード支払い合計
			const cardPayments = await db.prepare(`
				SELECT COALESCE(SUM(amount), 0) as total
				FROM monthly_card_payments
				WHERE monthly_record_id = ?
			`).bind(record.id).first<{ total: number }>();

			// 銀行残高合計
			const bankBalances = await db.prepare(`
				SELECT COALESCE(SUM(balance), 0) as total
				FROM monthly_bank_balances
				WHERE monthly_record_id = ?
			`).bind(record.id).first<{ total: number }>();

			const totalPayments = cardPayments?.total || 0;
			const totalBalances = bankBalances?.total || 0;
			const netBurden = totalPayments - totalBalances;
			const balance = record.expected_income - Math.max(netBurden, 0);

			return {
				yearMonth: record.year_month,
				expectedIncome: record.expected_income,
				totalPayments,
				totalBalances,
				netBurden: Math.max(netBurden, 0),
				balance
			};
		})
	);

	// 資産データを取得
	const assetRecords = await db.prepare(`
		SELECT id, record_date FROM asset_records
		WHERE user_id = ?
		ORDER BY record_date ASC
	`).bind(userId).all<{ id: number; record_date: string }>();

	const assetData = await Promise.all(
		assetRecords.results.map(async (record) => {
			// カテゴリ別の資産合計
			const assetsByCategory = await db.prepare(`
				SELECT category, SUM(amount) as total
				FROM asset_items
				WHERE asset_record_id = ?
				GROUP BY category
			`).bind(record.id).all<{ category: string; total: number }>();

			// 仮想通貨の合計
			const cryptoTotal = await db.prepare(`
				SELECT COALESCE(SUM(quantity * usd_price * jpy_rate), 0) as total
				FROM crypto_assets
				WHERE asset_record_id = ?
			`).bind(record.id).first<{ total: number }>();

			// ゴールドの合計
			const goldTotal = await db.prepare(`
				SELECT COALESCE(SUM(quantity * jpy_price), 0) as total
				FROM gold_assets
				WHERE asset_record_id = ?
			`).bind(record.id).first<{ total: number }>();

			const categoryTotals: Record<string, number> = {
				'現金': 0,
				'ポイント': 0,
				'現物資産': Math.round(goldTotal?.total || 0),
				'証券会社資産': 0,
				'仮想通貨資産': Math.round(cryptoTotal?.total || 0)
			};

			assetsByCategory.results.forEach(item => {
				if (categoryTotals[item.category] !== undefined) {
					categoryTotals[item.category] += item.total;
				}
			});

			const totalAssets = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

			return {
				recordDate: record.record_date,
				cash: categoryTotals['現金'],
				points: categoryTotals['ポイント'],
				realAssets: categoryTotals['現物資産'],
				securities: categoryTotals['証券会社資産'],
				crypto: categoryTotals['仮想通貨資産'],
				total: totalAssets
			};
		})
	);

	return { incomeData, assetData };
};
