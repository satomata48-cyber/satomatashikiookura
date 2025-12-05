<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	// モックデータ
	const transactions = [
		{ id: 1, amount: 280000, description: '11月給与', date: '2024-11-25', category_name: '給与', type: 'income' },
		{ id: 2, amount: 45000, description: 'スーパー', date: '2024-11-24', category_name: '食費', type: 'expense' },
		{ id: 3, amount: 12000, description: '電気代', date: '2024-11-20', category_name: '光熱費', type: 'expense' },
		{ id: 4, amount: 8500, description: 'スマホ代', date: '2024-11-15', category_name: '通信費', type: 'expense' },
		{ id: 5, amount: 3200, description: '映画・ゲーム', date: '2024-11-10', category_name: '娯楽費', type: 'expense' },
		{ id: 6, amount: 65000, description: '家賃', date: '2024-11-05', category_name: '住居費', type: 'expense' },
		{ id: 7, amount: 15000, description: '副業収入', date: '2024-11-03', category_name: '副収入', type: 'income' }
	];

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY'
		}).format(amount);
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
	}

	function getCategoryIcon(categoryName: string): string {
		const iconMap: Record<string, string> = {
			'給与': 'salary',
			'副収入': 'bonus',
			'投資収益': 'chart-up',
			'食費': 'food',
			'光熱費': 'utility',
			'通信費': 'phone',
			'交通費': 'transport',
			'住居費': 'home',
			'医療費': 'medical',
			'娯楽費': 'entertainment',
			'衣服費': 'clothing',
			'教育費': 'education'
		};
		return iconMap[categoryName] || 'wallet';
	}
</script>

<svelte:head>
	<title>取引一覧 - 家計簿アプリ</title>
</svelte:head>

<div class="p-6">
	<!-- ページタイトル -->
	<div class="flex justify-between items-center mb-6">
		<div>
			<h1 class="text-2xl font-bold text-slate-800">取引一覧</h1>
			<p class="text-slate-500">すべての収支を確認できます</p>
		</div>
		<a
			href="/transactions/new"
			class="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
		>
			<Icon name="plus" size={20} />
			<span>収支を追加</span>
		</a>
	</div>

	<!-- フィルター -->
	<div class="bg-white rounded-xl p-4 border border-slate-200 mb-6">
		<div class="flex flex-wrap gap-4">
			<div class="flex items-center gap-2">
				<label for="type" class="text-sm text-slate-600">種類:</label>
				<select id="type" class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
					<option value="">すべて</option>
					<option value="income">収入</option>
					<option value="expense">支出</option>
				</select>
			</div>
			<div class="flex items-center gap-2">
				<label for="period" class="text-sm text-slate-600">期間:</label>
				<select id="period" class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
					<option value="this-month">今月</option>
					<option value="last-month">先月</option>
					<option value="3-months">過去3ヶ月</option>
					<option value="all">すべて</option>
				</select>
			</div>
		</div>
	</div>

	<!-- 取引リスト -->
	<div class="bg-white rounded-xl border border-slate-200">
		<div class="divide-y divide-slate-200">
			{#each transactions as tx}
				<div class="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
					<div class="flex items-center gap-4">
						<div
							class="w-12 h-12 rounded-lg flex items-center justify-center"
							class:bg-emerald-50={tx.type === 'income'}
							class:text-emerald-500={tx.type === 'income'}
							class:bg-red-50={tx.type === 'expense'}
							class:text-red-500={tx.type === 'expense'}
						>
							<Icon name={getCategoryIcon(tx.category_name)} size={24} />
						</div>
						<div>
							<p class="font-medium text-slate-800">{tx.category_name}</p>
							<p class="text-sm text-slate-500">{tx.description || '説明なし'}</p>
						</div>
					</div>
					<div class="text-right">
						<p
							class="text-lg font-bold"
							class:text-emerald-500={tx.type === 'income'}
							class:text-red-500={tx.type === 'expense'}
						>
							{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
						</p>
						<p class="text-sm text-slate-500">{formatDate(tx.date)}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
