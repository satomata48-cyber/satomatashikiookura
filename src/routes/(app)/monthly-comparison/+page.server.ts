import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return { monthlyData: [] };
	}

	const userId = locals.user.id;

	// 全ての月次データを取得
	const monthlyRecords = await db.prepare(`
		SELECT
			mr.id,
			mr.year_month,
			mr.expected_income,
			mr.notes
		FROM monthly_records mr
		WHERE mr.user_id = ?
		ORDER BY mr.year_month DESC
	`).bind(userId).all<{
		id: number;
		year_month: string;
		expected_income: number;
		notes: string | null;
	}>();

	// 各月のカード支払いと残高を取得
	const monthlyData = await Promise.all(
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

			return {
				id: record.id,
				yearMonth: record.year_month,
				expectedIncome: record.expected_income,
				totalPayments,
				totalBalances,
				netBurden,
				notes: record.notes || ''
			};
		})
	);

	return { monthlyData };
};
