import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return { cards: [], banks: [], monthlyData: null, availableMonths: [] };
	}

	const userId = locals.user.id;

	// URLパラメータから月を取得、なければ現在の月
	const selectedMonth = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);

	// カードマスター取得（銀行ID、支払日含む）
	const cards = await db.prepare(
		'SELECT * FROM payment_cards WHERE user_id = ? AND is_active = 1 ORDER BY display_order'
	).bind(userId).all<{ id: number; name: string; display_order: number; bank_id: number | null; payment_day: number | null }>();

	// 銀行マスター取得
	const banks = await db.prepare(
		'SELECT * FROM banks WHERE user_id = ? AND is_active = 1 ORDER BY display_order'
	).bind(userId).all<{ id: number; name: string; display_order: number }>();

	// 利用可能な月のリスト取得
	const availableMonths = await db.prepare(
		'SELECT DISTINCT year_month FROM monthly_records WHERE user_id = ? ORDER BY year_month DESC'
	).bind(userId).all<{ year_month: string }>();

	// 選択月のデータ取得
	const monthlyRecord = await db.prepare(
		'SELECT * FROM monthly_records WHERE user_id = ? AND year_month = ?'
	).bind(userId, selectedMonth).first<{ id: number; year_month: string; expected_income: number; notes: string | null }>();

	if (!monthlyRecord) {
		return {
			cards: cards.results,
			banks: banks.results,
			monthlyData: null,
			selectedMonth,
			availableMonths: availableMonths.results.map(m => m.year_month)
		};
	}

	// カード支払い取得
	const cardPayments = await db.prepare(`
		SELECT mcp.card_id, mcp.amount, pc.name as card_name
		FROM monthly_card_payments mcp
		JOIN payment_cards pc ON mcp.card_id = pc.id
		WHERE mcp.monthly_record_id = ?
		ORDER BY pc.display_order
	`).bind(monthlyRecord.id).all<{ card_id: number; amount: number; card_name: string }>();

	// 銀行支払い取得
	const bankPayments = await db.prepare(`
		SELECT mbp.bank_id, mbp.amount, b.name as bank_name
		FROM monthly_bank_payments mbp
		JOIN banks b ON mbp.bank_id = b.id
		WHERE mbp.monthly_record_id = ?
		ORDER BY b.display_order
	`).bind(monthlyRecord.id).all<{ bank_id: number; amount: number; bank_name: string }>();

	// 銀行残高取得
	const bankBalances = await db.prepare(`
		SELECT mbb.bank_id, mbb.balance, b.name as bank_name
		FROM monthly_bank_balances mbb
		JOIN banks b ON mbb.bank_id = b.id
		WHERE mbb.monthly_record_id = ?
		ORDER BY b.display_order
	`).bind(monthlyRecord.id).all<{ bank_id: number; balance: number; bank_name: string }>();

	// 相殺負担金額取得
	const netPayments = await db.prepare(`
		SELECT mnp.bank_id, mnp.amount, b.name as bank_name
		FROM monthly_net_payments mnp
		JOIN banks b ON mnp.bank_id = b.id
		WHERE mnp.monthly_record_id = ?
		ORDER BY b.display_order
	`).bind(monthlyRecord.id).all<{ bank_id: number; amount: number; bank_name: string }>();

	return {
		cards: cards.results,
		banks: banks.results,
		selectedMonth,
		availableMonths: availableMonths.results.map(m => m.year_month),
		monthlyData: {
			id: monthlyRecord.id,
			expectedIncome: monthlyRecord.expected_income,
			notes: monthlyRecord.notes || '',
			cardPayments: cardPayments.results,
			bankPayments: bankPayments.results,
			bankBalances: bankBalances.results,
			netPayments: netPayments.results
		}
	};
};

export const actions: Actions = {
	// 月次レコード作成
	createMonth: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const yearMonth = formData.get('year_month') as string;

		if (!yearMonth) return fail(400, { error: '年月を指定してください' });

		try {
			await db.prepare(
				'INSERT INTO monthly_records (user_id, year_month) VALUES (?, ?)'
			).bind(locals.user.id, yearMonth).run();
		} catch {
			return fail(400, { error: '既に存在する月です' });
		}

		return { success: true };
	},

	// 手取り予想更新
	updateExpectedIncome: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const recordId = formData.get('record_id') as string;
		const amount = parseInt(formData.get('amount') as string) || 0;

		await db.prepare(
			'UPDATE monthly_records SET expected_income = ?, updated_at = datetime("now") WHERE id = ? AND user_id = ?'
		).bind(amount, recordId, locals.user.id).run();

		return { success: true };
	},

	// メモ更新
	updateNotes: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const recordId = formData.get('record_id') as string;
		const notes = formData.get('notes') as string || '';

		await db.prepare(
			'UPDATE monthly_records SET notes = ?, updated_at = datetime("now") WHERE id = ? AND user_id = ?'
		).bind(notes, recordId, locals.user.id).run();

		return { success: true };
	},

	// カード支払い更新・追加
	upsertCardPayment: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const recordId = formData.get('record_id') as string;
		const cardId = formData.get('card_id') as string;
		const amount = parseInt(formData.get('amount') as string) || 0;

		await db.prepare(`
			INSERT INTO monthly_card_payments (monthly_record_id, card_id, amount)
			VALUES (?, ?, ?)
			ON CONFLICT(monthly_record_id, card_id) DO UPDATE SET amount = excluded.amount
		`).bind(recordId, cardId, amount).run();

		return { success: true };
	},

	// 銀行支払い更新・追加
	upsertBankPayment: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const recordId = formData.get('record_id') as string;
		const bankId = formData.get('bank_id') as string;
		const amount = parseInt(formData.get('amount') as string) || 0;

		await db.prepare(`
			INSERT INTO monthly_bank_payments (monthly_record_id, bank_id, amount)
			VALUES (?, ?, ?)
			ON CONFLICT(monthly_record_id, bank_id) DO UPDATE SET amount = excluded.amount
		`).bind(recordId, bankId, amount).run();

		return { success: true };
	},

	// 銀行残高更新・追加
	upsertBankBalance: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const recordId = formData.get('record_id') as string;
		const bankId = formData.get('bank_id') as string;
		const balance = parseInt(formData.get('balance') as string) || 0;

		await db.prepare(`
			INSERT INTO monthly_bank_balances (monthly_record_id, bank_id, balance)
			VALUES (?, ?, ?)
			ON CONFLICT(monthly_record_id, bank_id) DO UPDATE SET balance = excluded.balance
		`).bind(recordId, bankId, balance).run();

		return { success: true };
	},

	// 相殺負担金額更新・追加
	upsertNetPayment: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const recordId = formData.get('record_id') as string;
		const bankId = formData.get('bank_id') as string;
		const amount = parseInt(formData.get('amount') as string) || 0;

		await db.prepare(`
			INSERT INTO monthly_net_payments (monthly_record_id, bank_id, amount)
			VALUES (?, ?, ?)
			ON CONFLICT(monthly_record_id, bank_id) DO UPDATE SET amount = excluded.amount
		`).bind(recordId, bankId, amount).run();

		return { success: true };
	},

	// カード追加
	addCard: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const bankIdStr = formData.get('bank_id') as string;
		const bankId = bankIdStr ? parseInt(bankIdStr) : null;

		if (!name) return fail(400, { error: 'カード名を入力してください' });

		try {
			await db.prepare(
				'INSERT INTO payment_cards (user_id, name, bank_id) VALUES (?, ?, ?)'
			).bind(locals.user.id, name, bankId).run();
		} catch {
			return fail(400, { error: '既に存在するカードです' });
		}

		return { success: true };
	},

	// カードの銀行紐付け更新
	updateCardBank: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const cardId = formData.get('card_id') as string;
		const bankIdStr = formData.get('bank_id') as string;
		const bankId = bankIdStr ? parseInt(bankIdStr) : null;

		await db.prepare(
			'UPDATE payment_cards SET bank_id = ? WHERE id = ? AND user_id = ?'
		).bind(bankId, cardId, locals.user.id).run();

		return { success: true };
	},

	// カードの支払日更新
	updateCardPaymentDay: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const cardId = formData.get('card_id') as string;
		const paymentDayStr = formData.get('payment_day') as string;
		const paymentDay = paymentDayStr ? parseInt(paymentDayStr) : null;

		await db.prepare(
			'UPDATE payment_cards SET payment_day = ? WHERE id = ? AND user_id = ?'
		).bind(paymentDay, cardId, locals.user.id).run();

		return { success: true };
	},

	// 銀行追加
	addBank: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const name = formData.get('name') as string;

		if (!name) return fail(400, { error: '銀行名を入力してください' });

		try {
			await db.prepare(
				'INSERT INTO banks (user_id, name) VALUES (?, ?)'
			).bind(locals.user.id, name).run();
		} catch {
			return fail(400, { error: '既に存在する銀行です' });
		}

		return { success: true };
	},

	// カード削除（非アクティブ化）
	deleteCard: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const cardId = formData.get('card_id') as string;

		await db.prepare(
			'UPDATE payment_cards SET is_active = 0 WHERE id = ? AND user_id = ?'
		).bind(cardId, locals.user.id).run();

		return { success: true };
	},

	// 銀行削除（非アクティブ化）
	deleteBank: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const bankId = formData.get('bank_id') as string;

		await db.prepare(
			'UPDATE banks SET is_active = 0 WHERE id = ? AND user_id = ?'
		).bind(bankId, locals.user.id).run();

		return { success: true };
	}
};
