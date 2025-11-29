<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	// モックデータ
	const categoryExpenses = [
		{ name: '食費', amount: 45000, percentage: 32, color: 'bg-orange-500' },
		{ name: '住居費', amount: 65000, percentage: 46, color: 'bg-blue-500' },
		{ name: '光熱費', amount: 12000, percentage: 9, color: 'bg-yellow-500' },
		{ name: '通信費', amount: 8500, percentage: 6, color: 'bg-purple-500' },
		{ name: '娯楽費', amount: 3200, percentage: 2, color: 'bg-pink-500' },
		{ name: 'その他', amount: 7300, percentage: 5, color: 'bg-slate-500' }
	];

	const monthlyTrend = [
		{ month: '6月', income: 295000, expense: 142000 },
		{ month: '7月', income: 310000, expense: 158000 },
		{ month: '8月', income: 280000, expense: 135000 },
		{ month: '9月', income: 305000, expense: 162000 },
		{ month: '10月', income: 298000, expense: 148000 },
		{ month: '11月', income: 295000, expense: 141000 }
	];

	const totalExpense = categoryExpenses.reduce((sum, c) => sum + c.amount, 0);

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY'
		}).format(amount);
	}

	const maxIncome = Math.max(...monthlyTrend.map(m => m.income));
</script>

<svelte:head>
	<title>レポート - 家計簿アプリ</title>
</svelte:head>

<div class="p-6">
	<!-- ページタイトル -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-slate-800">レポート</h1>
		<p class="text-slate-500">収支の分析と傾向を確認できます</p>
	</div>

	<!-- 期間選択 -->
	<div class="bg-white rounded-xl p-4 border border-slate-200 mb-6">
		<div class="flex items-center gap-4">
			<label for="period" class="text-sm text-slate-600">期間:</label>
			<select id="period" class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
				<option value="this-month">今月</option>
				<option value="3-months">過去3ヶ月</option>
				<option value="6-months" selected>過去6ヶ月</option>
				<option value="year">今年</option>
			</select>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- カテゴリ別支出 -->
		<section class="bg-white rounded-xl p-6 border border-slate-200">
			<h2 class="text-lg font-bold text-slate-800 mb-4">カテゴリ別支出</h2>

			<!-- 円グラフ風の表示 -->
			<div class="flex items-center justify-center mb-6">
				<div class="relative w-48 h-48">
					<svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
						{#each categoryExpenses as cat, i}
							{@const offset = categoryExpenses.slice(0, i).reduce((sum, c) => sum + c.percentage, 0)}
							<circle
								cx="50"
								cy="50"
								r="40"
								fill="transparent"
								stroke-width="20"
								class={cat.color.replace('bg-', 'stroke-')}
								stroke-dasharray="{cat.percentage * 2.51} 251"
								stroke-dashoffset="-{offset * 2.51}"
							/>
						{/each}
					</svg>
					<div class="absolute inset-0 flex items-center justify-center flex-col">
						<p class="text-sm text-slate-500">合計</p>
						<p class="text-lg font-bold text-slate-800">{formatCurrency(totalExpense)}</p>
					</div>
				</div>
			</div>

			<!-- カテゴリリスト -->
			<div class="space-y-3">
				{#each categoryExpenses as cat}
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-3 h-3 rounded-full {cat.color}"></div>
							<span class="text-slate-700">{cat.name}</span>
						</div>
						<div class="text-right">
							<span class="font-medium text-slate-800">{formatCurrency(cat.amount)}</span>
							<span class="text-sm text-slate-500 ml-2">({cat.percentage}%)</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- 月次推移 -->
		<section class="bg-white rounded-xl p-6 border border-slate-200">
			<h2 class="text-lg font-bold text-slate-800 mb-4">月次収支推移</h2>

			<div class="space-y-4">
				{#each monthlyTrend as month}
					<div>
						<div class="flex justify-between text-sm text-slate-600 mb-1">
							<span>{month.month}</span>
							<span>
								収支: <span class={month.income - month.expense >= 0 ? 'text-emerald-500' : 'text-red-500'}>
									{formatCurrency(month.income - month.expense)}
								</span>
							</span>
						</div>
						<div class="relative h-8 bg-slate-100 rounded">
							<div
								class="absolute inset-y-0 left-0 bg-emerald-500 rounded-l"
								style="width: {(month.income / maxIncome) * 100}%"
							></div>
							<div
								class="absolute inset-y-0 left-0 bg-red-500 rounded-l opacity-70"
								style="width: {(month.expense / maxIncome) * 100}%"
							></div>
						</div>
					</div>
				{/each}
			</div>

			<div class="flex gap-4 mt-4 text-sm">
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 bg-emerald-500 rounded"></div>
					<span class="text-slate-600">収入</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 bg-red-500 rounded"></div>
					<span class="text-slate-600">支出</span>
				</div>
			</div>
		</section>
	</div>

	<!-- 収支サマリー -->
	<section class="mt-6 bg-white rounded-xl p-6 border border-slate-200">
		<h2 class="text-lg font-bold text-slate-800 mb-4">期間サマリー（過去6ヶ月）</h2>
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div class="p-4 bg-emerald-50 rounded-lg">
				<p class="text-sm text-emerald-600">総収入</p>
				<p class="text-2xl font-bold text-emerald-600">
					{formatCurrency(monthlyTrend.reduce((sum, m) => sum + m.income, 0))}
				</p>
			</div>
			<div class="p-4 bg-red-50 rounded-lg">
				<p class="text-sm text-red-600">総支出</p>
				<p class="text-2xl font-bold text-red-600">
					{formatCurrency(monthlyTrend.reduce((sum, m) => sum + m.expense, 0))}
				</p>
			</div>
			<div class="p-4 bg-blue-50 rounded-lg">
				<p class="text-sm text-blue-600">貯蓄額</p>
				<p class="text-2xl font-bold text-blue-600">
					{formatCurrency(monthlyTrend.reduce((sum, m) => sum + (m.income - m.expense), 0))}
				</p>
			</div>
			<div class="p-4 bg-purple-50 rounded-lg">
				<p class="text-sm text-purple-600">貯蓄率</p>
				<p class="text-2xl font-bold text-purple-600">
					{Math.round((monthlyTrend.reduce((sum, m) => sum + (m.income - m.expense), 0) / monthlyTrend.reduce((sum, m) => sum + m.income, 0)) * 100)}%
				</p>
			</div>
		</div>
	</section>
</div>
