import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	// モックデータを返す（DB接続なし）
	const now = new Date();
	const year = now.getFullYear();

	// サンプルの月次データ
	const monthlyData = [];
	for (let i = 5; i >= 0; i--) {
		const d = new Date(year, now.getMonth() - i, 1);
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		monthlyData.push({
			month: `${y}/${m}`,
			income: Math.floor(Math.random() * 300000) + 200000,
			expense: Math.floor(Math.random() * 200000) + 100000
		});
	}

	// サンプルの取引データ
	const recentTransactions = [
		{ id: 1, amount: 280000, description: '11月給与', date: '2024-11-25', category_name: '給与', type: 'income' },
		{ id: 2, amount: 45000, description: 'スーパー', date: '2024-11-24', category_name: '食費', type: 'expense' },
		{ id: 3, amount: 12000, description: '電気代', date: '2024-11-20', category_name: '光熱費', type: 'expense' },
		{ id: 4, amount: 8500, description: 'スマホ代', date: '2024-11-15', category_name: '通信費', type: 'expense' },
		{ id: 5, amount: 3200, description: '映画・ゲーム', date: '2024-11-10', category_name: '娯楽費', type: 'expense' }
	];

	const income = 280000;
	const expense = 68700;

	return {
		summary: {
			income,
			expense,
			balance: income - expense
		},
		recentTransactions,
		assets: {
			cash: 1250000,
			investment: 850000,
			total: 2100000
		},
		monthlyData
	};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete('session', { path: '/' });
		throw redirect(302, '/');
	}
};
