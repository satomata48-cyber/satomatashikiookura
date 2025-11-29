import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return { assetRecords: [], assetItems: [], cryptoAssets: [], existingItems: [], existingCryptos: [], selectedMonth: null };
	}

	const userId = locals.user.id;

	// URLパラメータから月を取得（YYYY-MM形式）
	const selectedMonth = url.searchParams.get('month');

	// 利用可能な月のリスト取得
	const assetRecords = await db.prepare(
		'SELECT * FROM asset_records WHERE user_id = ? ORDER BY record_date DESC'
	).bind(userId).all<{ id: number; record_date: string }>();

	// 選択月または最新の月のデータを取得
	let currentRecord = null;
	if (selectedMonth) {
		currentRecord = await db.prepare(
			'SELECT * FROM asset_records WHERE user_id = ? AND record_date = ?'
		).bind(userId, selectedMonth).first<{ id: number; record_date: string }>();
	} else if (assetRecords.results.length > 0) {
		currentRecord = assetRecords.results[0];
	}

	if (!currentRecord) {
		// 既存の項目名をカテゴリ別に取得（プルダウン用）
		const existingItems = await db.prepare(`
			SELECT DISTINCT category, name FROM asset_items
			WHERE asset_record_id IN (SELECT id FROM asset_records WHERE user_id = ?)
			AND category != '仮想通貨資産'
			ORDER BY category, name
		`).bind(userId).all<{ category: string; name: string }>();

		const existingCryptos = await db.prepare(`
			SELECT DISTINCT name, memo FROM crypto_assets
			WHERE asset_record_id IN (SELECT id FROM asset_records WHERE user_id = ?)
			ORDER BY name
		`).bind(userId).all<{ name: string; memo: string | null }>();

		return {
			assetRecords: assetRecords.results,
			assetItems: [],
			cryptoAssets: [],
			existingItems: existingItems.results,
			existingCryptos: existingCryptos.results,
			selectedMonth: selectedMonth || null,
			currentRecord: null
		};
	}

	// 資産アイテム取得（仮想通貨以外）
	const assetItems = await db.prepare(
		"SELECT * FROM asset_items WHERE asset_record_id = ? AND category != '仮想通貨資産' ORDER BY category, id"
	).bind(currentRecord.id).all<{
		id: number;
		category: string;
		name: string;
		amount: number;
		memo: string | null;
	}>();

	// 仮想通貨資産取得
	const cryptoAssets = await db.prepare(
		'SELECT * FROM crypto_assets WHERE asset_record_id = ? ORDER BY id'
	).bind(currentRecord.id).all<{
		id: number;
		name: string;
		quantity: number;
		usd_price: number;
		jpy_rate: number;
		memo: string | null;
	}>();

	// 既存の項目名をカテゴリ別に取得（プルダウン用）
	const existingItems = await db.prepare(`
		SELECT DISTINCT category, name FROM asset_items
		WHERE asset_record_id IN (SELECT id FROM asset_records WHERE user_id = ?)
		AND category != '仮想通貨資産'
		ORDER BY category, name
	`).bind(userId).all<{ category: string; name: string }>();

	// 既存の仮想通貨名を取得
	const existingCryptos = await db.prepare(`
		SELECT DISTINCT name, memo FROM crypto_assets
		WHERE asset_record_id IN (SELECT id FROM asset_records WHERE user_id = ?)
		ORDER BY name
	`).bind(userId).all<{ name: string; memo: string | null }>();

	return {
		assetRecords: assetRecords.results,
		assetItems: assetItems.results,
		cryptoAssets: cryptoAssets.results,
		existingItems: existingItems.results,
		existingCryptos: existingCryptos.results,
		selectedMonth: currentRecord.record_date,
		currentRecord
	};
};

export const actions: Actions = {
	// 新規日付作成
	createRecord: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const recordDate = formData.get('record_date') as string;

		if (!recordDate) return fail(400, { error: '日付を指定してください' });

		try {
			await db.prepare(
				'INSERT INTO asset_records (user_id, record_date) VALUES (?, ?)'
			).bind(locals.user.id, recordDate).run();
		} catch {
			return fail(400, { error: '既に存在する日付です' });
		}

		return { success: true };
	},

	// 資産アイテム追加
	addItem: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const recordId = formData.get('record_id') as string;
		const category = formData.get('category') as string;
		const name = formData.get('name') as string;
		const amount = parseInt(formData.get('amount') as string) || 0;
		const memo = formData.get('memo') as string || null;

		if (!category || !name) return fail(400, { error: '必須項目を入力してください' });

		await db.prepare(
			'INSERT INTO asset_items (asset_record_id, category, name, amount, memo) VALUES (?, ?, ?, ?, ?)'
		).bind(recordId, category, name, amount, memo).run();

		return { success: true };
	},

	// 資産アイテム更新
	updateItem: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const itemId = formData.get('item_id') as string;
		const amount = parseInt(formData.get('amount') as string) || 0;

		await db.prepare(
			'UPDATE asset_items SET amount = ? WHERE id = ?'
		).bind(amount, itemId).run();

		return { success: true };
	},

	// 資産アイテム削除
	deleteItem: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const itemId = formData.get('item_id') as string;

		await db.prepare('DELETE FROM asset_items WHERE id = ?').bind(itemId).run();

		return { success: true };
	},

	// 仮想通貨追加
	addCrypto: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const recordId = formData.get('record_id') as string;
		const name = formData.get('name') as string;
		const quantity = parseFloat(formData.get('quantity') as string) || 0;
		const usdPrice = parseFloat(formData.get('usd_price') as string) || 0;
		const jpyRate = parseFloat(formData.get('jpy_rate') as string) || 150;
		const memo = formData.get('memo') as string || null;

		if (!name) return fail(400, { error: '通貨名を入力してください' });

		await db.prepare(
			'INSERT INTO crypto_assets (asset_record_id, name, quantity, usd_price, jpy_rate, memo) VALUES (?, ?, ?, ?, ?, ?)'
		).bind(recordId, name, quantity, usdPrice, jpyRate, memo).run();

		return { success: true };
	},

	// 仮想通貨更新
	updateCrypto: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const cryptoId = formData.get('crypto_id') as string;
		const quantity = parseFloat(formData.get('quantity') as string) || 0;
		const usdPrice = parseFloat(formData.get('usd_price') as string) || 0;
		const jpyRate = parseFloat(formData.get('jpy_rate') as string) || 150;

		await db.prepare(
			'UPDATE crypto_assets SET quantity = ?, usd_price = ?, jpy_rate = ? WHERE id = ?'
		).bind(quantity, usdPrice, jpyRate, cryptoId).run();

		return { success: true };
	},

	// 仮想通貨削除
	deleteCrypto: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const cryptoId = formData.get('crypto_id') as string;

		await db.prepare('DELETE FROM crypto_assets WHERE id = ?').bind(cryptoId).run();

		return { success: true };
	}
};
