<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	let { data } = $props();

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY'
		}).format(amount);
	}

	function formatMonth(yearMonth: string): string {
		const [year, month] = yearMonth.split('-');
		return `${year}年${parseInt(month)}月`;
	}

	function formatShortMonth(yearMonth: string): string {
		const [, month] = yearMonth.split('-');
		return `${parseInt(month)}月`;
	}

	// 直近12ヶ月のデータ
	const recentIncomeData = $derived([...data.incomeData].slice(-12));
	const recentAssetData = $derived([...data.assetData].slice(-12));

	// 最新月のデータ
	const latestIncome = $derived(recentIncomeData.length > 0 ? recentIncomeData[recentIncomeData.length - 1] : null);
	const latestAsset = $derived(recentAssetData.length > 0 ? recentAssetData[recentAssetData.length - 1] : null);
	const prevAsset = $derived(recentAssetData.length > 1 ? recentAssetData[recentAssetData.length - 2] : null);

	// 資産増減
	const assetChange = $derived(
		latestAsset && prevAsset ? latestAsset.total - prevAsset.total : 0
	);
	const assetChangePercent = $derived(
		prevAsset && prevAsset.total > 0 ? ((assetChange / prevAsset.total) * 100) : 0
	);

	// 収支の最大値
	const maxPayment = $derived(Math.max(...recentIncomeData.map(d => d.totalPayments), 1));
	const maxAsset = $derived(Math.max(...recentAssetData.map(d => d.total), 1));

	// バーの高さを計算
	function getBarHeight(value: number, max: number, maxHeight: number = 120): number {
		return Math.max((value / max) * maxHeight, 4);
	}

	// 平均値計算
	const avgPayment = $derived(
		recentIncomeData.length > 0
			? recentIncomeData.reduce((sum, d) => sum + d.totalPayments, 0) / recentIncomeData.length
			: 0
	);
	const avgBalance = $derived(
		recentIncomeData.length > 0
			? recentIncomeData.reduce((sum, d) => sum + d.balance, 0) / recentIncomeData.length
			: 0
	);

	// 月別データを結合（収支と資産を同じ月で対応させる）
	const combinedMonthlyData = $derived(() => {
		const incomeMap = new Map(recentIncomeData.map(d => [d.yearMonth, d]));
		const assetMap = new Map(recentAssetData.map(d => [d.recordDate, d]));

		// 全ての月を取得
		const allMonths = new Set([
			...recentIncomeData.map(d => d.yearMonth),
			...recentAssetData.map(d => d.recordDate)
		]);

		return Array.from(allMonths).sort().map(month => ({
			month,
			income: incomeMap.get(month) || null,
			asset: assetMap.get(month) || null
		}));
	});
</script>

<svelte:head>
	<title>総合レポート - 家計簿アプリ</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6">
	<!-- ヘッダー -->
	<div class="mb-6">
		<h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
			総合レポート
		</h1>
		<p class="text-sm sm:text-base text-slate-500 mt-1">収支と資産の推移を比較</p>
	</div>

	{#if recentIncomeData.length === 0 && recentAssetData.length === 0}
		<div class="bg-white/80 backdrop-blur rounded-2xl p-12 border border-slate-200/50 text-center shadow-xl">
			<div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
				<Icon name="report" size={40} class="text-indigo-400" />
			</div>
			<p class="text-xl text-slate-600 font-medium">データがありません</p>
			<p class="text-slate-400 mt-2">月次収支・資産ページでデータを追加してください</p>
		</div>
	{:else}
		<!-- サマリーカード -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
			<!-- 最新月の総資産 -->
			<div class="bg-white/80 backdrop-blur rounded-xl p-4 border border-emerald-200 shadow-lg">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center">
						<Icon name="sparkle" size={16} class="text-white" />
					</div>
					<span class="text-xs sm:text-sm text-slate-500">総資産</span>
				</div>
				<p class="text-lg sm:text-2xl font-bold text-emerald-600">
					{latestAsset ? formatCurrency(latestAsset.total) : '-'}
				</p>
				{#if assetChange !== 0}
					<p class="text-xs sm:text-sm {assetChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
						{assetChange >= 0 ? '+' : ''}{formatCurrency(assetChange)} ({assetChangePercent >= 0 ? '+' : ''}{assetChangePercent.toFixed(1)}%)
					</p>
				{/if}
			</div>

			<!-- 最新月の実質負担 -->
			<div class="bg-white/80 backdrop-blur rounded-xl p-4 border border-rose-200 shadow-lg">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-lg flex items-center justify-center">
						<Icon name="chart-down" size={16} class="text-white" />
					</div>
					<span class="text-xs sm:text-sm text-slate-500">実質負担</span>
				</div>
				<p class="text-lg sm:text-2xl font-bold text-rose-600">
					{latestIncome ? formatCurrency(latestIncome.netBurden) : '-'}
				</p>
			</div>

			<!-- 平均支出 -->
			<div class="bg-white/80 backdrop-blur rounded-xl p-4 border border-amber-200 shadow-lg">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center">
						<Icon name="wallet" size={16} class="text-white" />
					</div>
					<span class="text-xs sm:text-sm text-slate-500">平均支出</span>
				</div>
				<p class="text-lg sm:text-2xl font-bold text-amber-600">
					{formatCurrency(avgPayment)}
				</p>
				<p class="text-xs text-slate-400">直近{recentIncomeData.length}ヶ月</p>
			</div>

			<!-- 平均収支バランス -->
			<div class="bg-white/80 backdrop-blur rounded-xl p-4 border border-blue-200 shadow-lg">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
						<Icon name="chart-up" size={16} class="text-white" />
					</div>
					<span class="text-xs sm:text-sm text-slate-500">平均収支</span>
				</div>
				<p class="text-lg sm:text-2xl font-bold {avgBalance >= 0 ? 'text-blue-600' : 'text-rose-600'}">
					{avgBalance >= 0 ? '+' : ''}{formatCurrency(avgBalance)}
				</p>
				<p class="text-xs text-slate-400">直近{recentIncomeData.length}ヶ月</p>
			</div>
		</div>

		<!-- 資産推移グラフ -->
		{#if recentAssetData.length > 0}
			<section class="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-6 border border-slate-200/50 shadow-xl mb-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
						<Icon name="investment" size={20} class="text-white" />
					</div>
					<h2 class="text-lg sm:text-xl font-bold text-slate-800">総資産推移</h2>
				</div>

				<div class="overflow-x-auto">
					<div class="flex items-end gap-2 sm:gap-3 min-w-max pb-2" style="height: 180px;">
						{#each recentAssetData as month}
							<div class="flex flex-col items-center gap-1 w-12 sm:w-16">
								<span class="text-xs font-medium text-emerald-700">
									{Math.round(month.total / 10000)}万
								</span>
								<div
									class="w-8 sm:w-10 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t transition-all hover:from-emerald-600 hover:to-teal-500 cursor-pointer"
									style="height: {getBarHeight(month.total, maxAsset, 120)}px"
									title="{formatMonth(month.recordDate)}: {formatCurrency(month.total)}"
								></div>
								<span class="text-xs text-slate-500">{formatShortMonth(month.recordDate)}</span>
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<!-- 収支推移グラフ -->
		{#if recentIncomeData.length > 0}
			<section class="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-6 border border-slate-200/50 shadow-xl mb-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
						<Icon name="wallet" size={20} class="text-white" />
					</div>
					<h2 class="text-lg sm:text-xl font-bold text-slate-800">支出推移</h2>
				</div>

				<div class="overflow-x-auto">
					<div class="flex items-end gap-2 sm:gap-3 min-w-max pb-2" style="height: 180px;">
						{#each recentIncomeData as month}
							<div class="flex flex-col items-center gap-1 w-12 sm:w-16">
								<span class="text-xs font-medium text-rose-700">
									{Math.round(month.totalPayments / 10000)}万
								</span>
								<div
									class="w-8 sm:w-10 bg-gradient-to-t from-rose-500 to-pink-400 rounded-t transition-all hover:from-rose-600 hover:to-pink-500 cursor-pointer"
									style="height: {getBarHeight(month.totalPayments, maxPayment, 120)}px"
									title="{formatMonth(month.yearMonth)}: {formatCurrency(month.totalPayments)}"
								></div>
								<span class="text-xs text-slate-500">{formatShortMonth(month.yearMonth)}</span>
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<!-- 月別データテーブル -->
		<section class="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-6 border border-slate-200/50 shadow-xl">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center shadow-lg">
					<Icon name="report" size={20} class="text-white" />
				</div>
				<h2 class="text-lg sm:text-xl font-bold text-slate-800">月別データ</h2>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-slate-200">
							<th class="text-left py-2 px-2 font-semibold text-slate-600">年月</th>
							<th class="text-right py-2 px-2 font-semibold text-emerald-600">総資産</th>
							<th class="text-right py-2 px-2 font-semibold text-rose-600">支出</th>
							<th class="text-right py-2 px-2 font-semibold text-blue-600">残高</th>
							<th class="text-right py-2 px-2 font-semibold text-amber-600">実質負担</th>
							<th class="text-right py-2 px-2 font-semibold text-purple-600">収支</th>
						</tr>
					</thead>
					<tbody>
						{#each [...combinedMonthlyData()].reverse() as row}
							<tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
								<td class="py-2 px-2 font-medium text-slate-700">
									{formatMonth(row.month)}
								</td>
								<td class="py-2 px-2 text-right text-emerald-600 font-medium">
									{row.asset ? formatCurrency(row.asset.total) : '-'}
								</td>
								<td class="py-2 px-2 text-right text-rose-600">
									{row.income ? formatCurrency(row.income.totalPayments) : '-'}
								</td>
								<td class="py-2 px-2 text-right text-blue-600">
									{row.income ? formatCurrency(row.income.totalBalances) : '-'}
								</td>
								<td class="py-2 px-2 text-right text-amber-600">
									{row.income ? formatCurrency(row.income.netBurden) : '-'}
								</td>
								<td class="py-2 px-2 text-right font-medium {row.income && row.income.balance >= 0 ? 'text-purple-600' : 'text-rose-600'}">
									{#if row.income}
										{row.income.balance >= 0 ? '+' : ''}{formatCurrency(row.income.balance)}
									{:else}
										-
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}
</div>
