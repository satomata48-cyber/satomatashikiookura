import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return { monthlyAssets: [] };
	}

	const userId = locals.user.id;

	// 全ての資産レコードを取得
	const assetRecords = await db.prepare(`
		SELECT id, record_date FROM asset_records
		WHERE user_id = ?
		ORDER BY record_date ASC
	`).bind(userId).all<{ id: number; record_date: string }>();

	// 各月の資産データを集計
	const monthlyAssets = await Promise.all(
		assetRecords.results.map(async (record) => {
			// カテゴリ別の資産合計
			const assetsByCategory = await db.prepare(`
				SELECT category, SUM(amount) as total
				FROM asset_items
				WHERE asset_record_id = ?
				GROUP BY category
			`).bind(record.id).all<{ category: string; total: number }>();

			// 仮想通貨の合計（quantity * usd_price * jpy_rate）
			const cryptoTotal = await db.prepare(`
				SELECT COALESCE(SUM(quantity * usd_price * jpy_rate), 0) as total
				FROM crypto_assets
				WHERE asset_record_id = ?
			`).bind(record.id).first<{ total: number }>();

			// ゴールドの合計（quantity * jpy_price）
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

	// 前月比を計算
	const monthlyAssetsWithChange = monthlyAssets.map((current, index) => {
		if (index === 0) {
			return {
				...current,
				changes: {
					cash: null,
					points: null,
					realAssets: null,
					securities: null,
					crypto: null,
					total: null
				}
			};
		}

		const prev = monthlyAssets[index - 1];
		const calcChange = (curr: number, previous: number) => {
			if (previous === 0) return curr > 0 ? 100 : 0;
			return ((curr - previous) / previous) * 100;
		};

		return {
			...current,
			changes: {
				cash: calcChange(current.cash, prev.cash),
				points: calcChange(current.points, prev.points),
				realAssets: calcChange(current.realAssets, prev.realAssets),
				securities: calcChange(current.securities, prev.securities),
				crypto: calcChange(current.crypto, prev.crypto),
				total: calcChange(current.total, prev.total)
			}
		};
	});

	return { monthlyAssets: monthlyAssetsWithChange };
};
