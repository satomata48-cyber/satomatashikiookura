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
		return `${year}/${parseInt(month)}`;
	}

	function formatShortMonth(yearMonth: string): string {
		const [, month] = yearMonth.split('-');
		return `${parseInt(month)}月`;
	}

	// 最大値を計算してスケールを調整
	const maxPayment = $derived(
		Math.max(...data.monthlyData.map(d => d.totalPayments), 1)
	);
	const maxBalance = $derived(
		Math.max(...data.monthlyData.map(d => d.totalBalances), 1)
	);
	const maxNetBurden = $derived(
		Math.max(...data.monthlyData.map(d => Math.abs(d.netBurden)), 1)
	);

	// バーの高さをパーセンテージで計算（最大200px）
	function getBarHeight(value: number, max: number): number {
		return Math.max((value / max) * 200, 4);
	}

	// 直近12ヶ月のデータを取得（古い順に並べ替え）
	const recentData = $derived(
		[...data.monthlyData].reverse().slice(-12)
	);

	// 平均値を計算
	const avgPayment = $derived(
		recentData.length > 0
			? recentData.reduce((sum, d) => sum + d.totalPayments, 0) / recentData.length
			: 0
	);
	const avgBalance = $derived(
		recentData.length > 0
			? recentData.reduce((sum, d) => sum + d.totalBalances, 0) / recentData.length
			: 0
	);
	const avgNetBurden = $derived(
		recentData.length > 0
			? recentData.reduce((sum, d) => sum + d.netBurden, 0) / recentData.length
			: 0
	);
</script>

<svelte:head>
	<title>月次収支比較 - 家計簿アプリ</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6">
	<!-- ヘッダー -->
	<div class="mb-6 sm:mb-8">
		<h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
			月次収支比較
		</h1>
		<p class="text-sm sm:text-base text-slate-500 mt-1">月別の収支推移をグラフで確認</p>
	</div>

	{#if recentData.length === 0}
		<div class="bg-white/80 backdrop-blur rounded-2xl p-12 border border-slate-200/50 text-center shadow-xl">
			<div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
				<Icon name="chart-up" size={40} class="text-indigo-400" />
			</div>
			<p class="text-xl text-slate-600 font-medium">データがありません</p>
			<p class="text-slate-400 mt-2">月次収支ページでデータを追加してください</p>
		</div>
	{:else}
		<!-- 平均サマリー -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
			<div class="bg-white/80 backdrop-blur rounded-2xl p-5 border border-rose-100 shadow-lg">
				<div class="flex items-center gap-3 mb-2">
					<div class="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
						<Icon name="wallet" size={20} class="text-white" />
					</div>
					<span class="text-sm text-slate-500">平均支払額</span>
				</div>
				<p class="text-2xl font-bold text-rose-600">{formatCurrency(avgPayment)}</p>
			</div>

			<div class="bg-white/80 backdrop-blur rounded-2xl p-5 border border-blue-100 shadow-lg">
				<div class="flex items-center gap-3 mb-2">
					<div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg">
						<Icon name="bank" size={20} class="text-white" />
					</div>
					<span class="text-sm text-slate-500">平均残高</span>
				</div>
				<p class="text-2xl font-bold text-blue-600">{formatCurrency(avgBalance)}</p>
			</div>

			<div class="bg-white/80 backdrop-blur rounded-2xl p-5 border border-amber-100 shadow-lg">
				<div class="flex items-center gap-3 mb-2">
					<div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
						<Icon name="chart-down" size={20} class="text-white" />
					</div>
					<span class="text-sm text-slate-500">平均実質負担</span>
				</div>
				<p class="text-2xl font-bold text-amber-600">{formatCurrency(avgNetBurden)}</p>
			</div>
		</div>

		<!-- 支払額グラフ -->
		<section class="bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-200/50 shadow-xl mb-6">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
					<Icon name="wallet" size={20} class="text-white" />
				</div>
				<h2 class="text-xl font-bold text-slate-800">月別支払額</h2>
			</div>

			<div class="overflow-x-auto">
				<div class="flex items-end gap-2 min-w-max pb-4" style="height: 280px;">
					{#each recentData as month}
						<div class="flex flex-col items-center gap-2 w-16">
							<span class="text-xs text-slate-500 font-medium">{formatCurrency(month.totalPayments)}</span>
							<div
								class="w-10 bg-gradient-to-t from-rose-500 to-pink-400 rounded-t-lg transition-all hover:from-rose-600 hover:to-pink-500 cursor-pointer"
								style="height: {getBarHeight(month.totalPayments, maxPayment)}px"
								title="{formatMonth(month.yearMonth)}: {formatCurrency(month.totalPayments)}"
							></div>
							<span class="text-xs text-slate-600 font-medium">{formatShortMonth(month.yearMonth)}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- 残高グラフ -->
		<section class="bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-200/50 shadow-xl mb-6">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg">
					<Icon name="bank" size={20} class="text-white" />
				</div>
				<h2 class="text-xl font-bold text-slate-800">月別残高</h2>
			</div>

			<div class="overflow-x-auto">
				<div class="flex items-end gap-2 min-w-max pb-4" style="height: 280px;">
					{#each recentData as month}
						<div class="flex flex-col items-center gap-2 w-16">
							<span class="text-xs text-slate-500 font-medium">{formatCurrency(month.totalBalances)}</span>
							<div
								class="w-10 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-indigo-500 cursor-pointer"
								style="height: {getBarHeight(month.totalBalances, maxBalance)}px"
								title="{formatMonth(month.yearMonth)}: {formatCurrency(month.totalBalances)}"
							></div>
							<span class="text-xs text-slate-600 font-medium">{formatShortMonth(month.yearMonth)}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- 実質負担グラフ -->
		<section class="bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-200/50 shadow-xl mb-6">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
					<Icon name="chart-down" size={20} class="text-white" />
				</div>
				<h2 class="text-xl font-bold text-slate-800">月別実質負担額</h2>
			</div>

			<div class="overflow-x-auto">
				<div class="flex items-end gap-2 min-w-max pb-4" style="height: 280px;">
					{#each recentData as month}
						<div class="flex flex-col items-center gap-2 w-16">
							<span class="text-xs font-medium {month.netBurden >= 0 ? 'text-amber-600' : 'text-emerald-600'}">
								{formatCurrency(month.netBurden)}
							</span>
							<div
								class="w-10 rounded-t-lg transition-all cursor-pointer {month.netBurden >= 0 ? 'bg-gradient-to-t from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500' : 'bg-gradient-to-t from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500'}"
								style="height: {getBarHeight(Math.abs(month.netBurden), maxNetBurden)}px"
								title="{formatMonth(month.yearMonth)}: {formatCurrency(month.netBurden)}"
							></div>
							<span class="text-xs text-slate-600 font-medium">{formatShortMonth(month.yearMonth)}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- データテーブル -->
		<section class="bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-200/50 shadow-xl">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center shadow-lg">
					<Icon name="report" size={20} class="text-white" />
				</div>
				<h2 class="text-xl font-bold text-slate-800">月次データ一覧</h2>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-slate-200">
							<th class="text-left py-3 px-4 text-sm font-semibold text-slate-600">年月</th>
							<th class="text-right py-3 px-4 text-sm font-semibold text-slate-600">支払額</th>
							<th class="text-right py-3 px-4 text-sm font-semibold text-slate-600">残高</th>
							<th class="text-right py-3 px-4 text-sm font-semibold text-slate-600">実質負担</th>
						</tr>
					</thead>
					<tbody>
						{#each data.monthlyData as month}
							<tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
								<td class="py-3 px-4">
									<a href="/monthly-income?month={month.yearMonth}" class="text-indigo-600 hover:text-indigo-800 font-medium">
										{formatMonth(month.yearMonth)}
									</a>
								</td>
								<td class="py-3 px-4 text-right font-medium text-rose-600">{formatCurrency(month.totalPayments)}</td>
								<td class="py-3 px-4 text-right font-medium text-blue-600">{formatCurrency(month.totalBalances)}</td>
								<td class="py-3 px-4 text-right font-medium {month.netBurden >= 0 ? 'text-amber-600' : 'text-emerald-600'}">
									{formatCurrency(month.netBurden)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}
</div>
