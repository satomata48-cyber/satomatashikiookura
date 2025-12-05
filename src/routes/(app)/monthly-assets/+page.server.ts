import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, locals, platform }) => {
	const db = platform?.env?.DB;
	if (!db || !locals.user) {
		return { assetRecords: [], assetItems: [], cryptoAssets: [], goldAssets: [], existingItems: [], existingCryptos: [], existingGolds: [], selectedMonth: null };
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

	// 最新のレコードID（コピー元として使用）
	const latestRecord = assetRecords.results.length > 0 ? assetRecords.results[0] : null;

	// 前月のレコードを取得（現在の月の1つ前）
	const getPreviousRecord = () => {
		if (!currentRecord) return null;
		const currentIndex = assetRecords.results.findIndex(r => r.id === currentRecord.id);
		if (currentIndex >= 0 && currentIndex < assetRecords.results.length - 1) {
			return assetRecords.results[currentIndex + 1];
		}
		return null;
	};

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

		const existingGolds = await db.prepare(`
			SELECT DISTINCT name, memo FROM gold_assets
			WHERE asset_record_id IN (SELECT id FROM asset_records WHERE user_id = ?)
			ORDER BY name
		`).bind(userId).all<{ name: string; memo: string | null }>();

		return {
			assetRecords: assetRecords.results,
			assetItems: [],
			cryptoAssets: [],
			goldAssets: [],
			existingItems: existingItems.results,
			existingCryptos: existingCryptos.results,
			existingGolds: existingGolds.results,
			selectedMonth: selectedMonth || null,
			currentRecord: null,
			latestRecord
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

	// ゴールド資産取得
	const goldAssets = await db.prepare(
		'SELECT * FROM gold_assets WHERE asset_record_id = ? ORDER BY id'
	).bind(currentRecord.id).all<{
		id: number;
		name: string;
		quantity: number;
		jpy_price: number;
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

	// 既存のゴールド資産名を取得
	const existingGolds = await db.prepare(`
		SELECT DISTINCT name, memo FROM gold_assets
		WHERE asset_record_id IN (SELECT id FROM asset_records WHERE user_id = ?)
		ORDER BY name
	`).bind(userId).all<{ name: string; memo: string | null }>();

	return {
		assetRecords: assetRecords.results,
		assetItems: assetItems.results,
		cryptoAssets: cryptoAssets.results,
		goldAssets: goldAssets.results,
		existingItems: existingItems.results,
		existingCryptos: existingCryptos.results,
		existingGolds: existingGolds.results,
		selectedMonth: currentRecord.record_date,
		currentRecord,
		latestRecord,
		previousRecord: getPreviousRecord()
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

	// 資産アイテム一括更新
	updateAllItems: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const updates = formData.get('updates') as string;

		if (!updates) return fail(400, { error: '更新データがありません' });

		const items: { id: number; amount: number }[] = JSON.parse(updates);

		// バッチで更新
		for (const item of items) {
			await db.prepare(
				'UPDATE asset_items SET amount = ? WHERE id = ?'
			).bind(item.amount, item.id).run();
		}

		return { success: true };
	},

	// 仮想通貨一括更新
	updateAllCryptos: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const updates = formData.get('updates') as string;

		if (!updates) return fail(400, { error: '更新データがありません' });

		const items: { id: number; quantity: number; usd_price: number; jpy_rate: number }[] = JSON.parse(updates);

		for (const item of items) {
			await db.prepare(
				'UPDATE crypto_assets SET quantity = ?, usd_price = ?, jpy_rate = ? WHERE id = ?'
			).bind(item.quantity, item.usd_price, item.jpy_rate, item.id).run();
		}

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
	},

	// ゴールド追加
	addGold: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const recordId = formData.get('record_id') as string;
		const name = formData.get('name') as string;
		const quantity = parseFloat(formData.get('quantity') as string) || 0;
		const jpyPrice = parseFloat(formData.get('jpy_price') as string) || 0;
		const memo = formData.get('memo') as string || null;

		if (!name) return fail(400, { error: '資産名を入力してください' });

		await db.prepare(
			'INSERT INTO gold_assets (asset_record_id, name, quantity, jpy_price, memo) VALUES (?, ?, ?, ?, ?)'
		).bind(recordId, name, quantity, jpyPrice, memo).run();

		return { success: true };
	},

	// ゴールド一括更新
	updateAllGolds: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const updates = formData.get('updates') as string;

		if (!updates) return fail(400, { error: '更新データがありません' });

		const items: { id: number; quantity: number; jpy_price: number }[] = JSON.parse(updates);

		for (const item of items) {
			await db.prepare(
				'UPDATE gold_assets SET quantity = ?, jpy_price = ? WHERE id = ?'
			).bind(item.quantity, item.jpy_price, item.id).run();
		}

		return { success: true };
	},

	// ゴールド削除
	deleteGold: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const goldId = formData.get('gold_id') as string;

		await db.prepare('DELETE FROM gold_assets WHERE id = ?').bind(goldId).run();

		return { success: true };
	},

	// 過去のデータを参照して新しい月を作成
	createFromPrevious: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const newMonth = formData.get('new_month') as string;
		const sourceRecordId = formData.get('source_record_id') as string;

		if (!newMonth) return fail(400, { error: '月を指定してください' });

		// 既に同じ月のデータがあるかチェック
		const existing = await db.prepare(
			'SELECT id FROM asset_records WHERE user_id = ? AND record_date = ?'
		).bind(locals.user.id, newMonth).first();

		if (existing) {
			return fail(400, { error: 'この月のデータは既に存在します' });
		}

		// 新しいレコードを作成
		const result = await db.prepare(
			'INSERT INTO asset_records (user_id, record_date) VALUES (?, ?)'
		).bind(locals.user.id, newMonth).run();

		const newRecordId = result.meta.last_row_id;

		// 過去のデータがある場合はコピー
		if (sourceRecordId) {
			// 資産アイテムをコピー
			await db.prepare(`
				INSERT INTO asset_items (asset_record_id, category, name, amount, memo)
				SELECT ?, category, name, amount, memo
				FROM asset_items
				WHERE asset_record_id = ?
			`).bind(newRecordId, sourceRecordId).run();

			// 仮想通貨をコピー
			await db.prepare(`
				INSERT INTO crypto_assets (asset_record_id, name, quantity, usd_price, jpy_rate, memo)
				SELECT ?, name, quantity, usd_price, jpy_rate, memo
				FROM crypto_assets
				WHERE asset_record_id = ?
			`).bind(newRecordId, sourceRecordId).run();

			// ゴールドをコピー
			await db.prepare(`
				INSERT INTO gold_assets (asset_record_id, name, quantity, jpy_price, memo)
				SELECT ?, name, quantity, jpy_price, memo
				FROM gold_assets
				WHERE asset_record_id = ?
			`).bind(newRecordId, sourceRecordId).run();
		}

		throw redirect(303, `/monthly-assets?month=${newMonth}`);
	},

	// 先月のデータを現在の月に反映
	copyFromPrevious: async ({ request, locals, platform }) => {
		const db = platform?.env?.DB;
		if (!db || !locals.user) return fail(401);

		const formData = await request.formData();
		const currentRecordId = formData.get('current_record_id') as string;
		const sourceRecordId = formData.get('source_record_id') as string;

		if (!currentRecordId || !sourceRecordId) {
			return fail(400, { error: 'パラメータが不足しています' });
		}

		// 現在のデータを削除
		await db.prepare('DELETE FROM asset_items WHERE asset_record_id = ?').bind(currentRecordId).run();
		await db.prepare('DELETE FROM crypto_assets WHERE asset_record_id = ?').bind(currentRecordId).run();
		await db.prepare('DELETE FROM gold_assets WHERE asset_record_id = ?').bind(currentRecordId).run();

		// 過去のデータをコピー
		await db.prepare(`
			INSERT INTO asset_items (asset_record_id, category, name, amount, memo)
			SELECT ?, category, name, amount, memo
			FROM asset_items
			WHERE asset_record_id = ?
		`).bind(currentRecordId, sourceRecordId).run();

		await db.prepare(`
			INSERT INTO crypto_assets (asset_record_id, name, quantity, usd_price, jpy_rate, memo)
			SELECT ?, name, quantity, usd_price, jpy_rate, memo
			FROM crypto_assets
			WHERE asset_record_id = ?
		`).bind(currentRecordId, sourceRecordId).run();

		await db.prepare(`
			INSERT INTO gold_assets (asset_record_id, name, quantity, jpy_price, memo)
			SELECT ?, name, quantity, jpy_price, memo
			FROM gold_assets
			WHERE asset_record_id = ?
		`).bind(currentRecordId, sourceRecordId).run();

		return { success: true };
	}
};
