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

	function formatPercent(value: number | null): string {
		if (value === null) return '-';
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(1)}%`;
	}

	// カテゴリ別の色設定
	const categoryColors = {
		cash: { bar: 'from-emerald-500 to-teal-400', text: 'text-emerald-600', bg: 'bg-emerald-50' },
		points: { bar: 'from-blue-500 to-indigo-400', text: 'text-blue-600', bg: 'bg-blue-50' },
		realAssets: { bar: 'from-amber-500 to-yellow-400', text: 'text-amber-600', bg: 'bg-amber-50' },
		securities: { bar: 'from-purple-500 to-violet-400', text: 'text-purple-600', bg: 'bg-purple-50' },
		crypto: { bar: 'from-orange-500 to-red-400', text: 'text-orange-600', bg: 'bg-orange-50' },
		total: { bar: 'from-slate-600 to-slate-400', text: 'text-slate-800', bg: 'bg-slate-100' }
	};

	// 最大値を計算
	const maxTotal = $derived(
		Math.max(...data.monthlyAssets.map(d => d.total), 1)
	);

	// バーの高さをパーセンテージで計算
	function getBarHeight(value: number, max: number): number {
		return Math.max((value / max) * 180, 2);
	}

	// 積み上げバーのデータを計算
	function getStackedData(month: typeof data.monthlyAssets[0]) {
		const categories = [
			{ key: 'cash', value: month.cash, label: '現金' },
			{ key: 'points', value: month.points, label: 'ポイント' },
			{ key: 'realAssets', value: month.realAssets, label: '現物資産' },
			{ key: 'securities', value: month.securities, label: '証券会社' },
			{ key: 'crypto', value: month.crypto, label: '仮想通貨' }
		];
		return categories;
	}

	// 最新月のデータ
	const latestMonth = $derived(
		data.monthlyAssets.length > 0 ? data.monthlyAssets[data.monthlyAssets.length - 1] : null
	);

	// 前月のデータ
	const prevMonth = $derived(
		data.monthlyAssets.length > 1 ? data.monthlyAssets[data.monthlyAssets.length - 2] : null
	);

	// カテゴリ選択用のstate
	type CategoryKey = 'total' | 'cash' | 'points' | 'realAssets' | 'securities' | 'crypto';
	let selectedCategory = $state<CategoryKey>('total');

	// カテゴリ定義
	const categoryOptions: { key: CategoryKey; label: string; color: string; borderColor: string; textColor: string }[] = [
		{ key: 'total', label: '総資産', color: 'from-indigo-500 to-purple-400', borderColor: 'border-indigo-200', textColor: 'text-indigo-600' },
		{ key: 'cash', label: '現金', color: 'from-emerald-500 to-teal-400', borderColor: 'border-emerald-200', textColor: 'text-emerald-600' },
		{ key: 'points', label: 'ポイント', color: 'from-blue-500 to-indigo-400', borderColor: 'border-blue-200', textColor: 'text-blue-600' },
		{ key: 'realAssets', label: '現物資産', color: 'from-amber-500 to-yellow-400', borderColor: 'border-amber-200', textColor: 'text-amber-600' },
		{ key: 'securities', label: '証券会社', color: 'from-purple-500 to-violet-400', borderColor: 'border-purple-200', textColor: 'text-purple-600' },
		{ key: 'crypto', label: '仮想通貨', color: 'from-orange-500 to-red-400', borderColor: 'border-orange-200', textColor: 'text-orange-600' }
	];

	// 選択されたカテゴリの情報を取得
	const selectedCategoryInfo = $derived(
		categoryOptions.find(c => c.key === selectedCategory)!
	);

	// 選択されたカテゴリのデータを取得
	function getCategoryValue(month: typeof data.monthlyAssets[0], key: CategoryKey): number {
		return month[key];
	}

	function getCategoryChange(month: typeof data.monthlyAssets[0], key: CategoryKey): number | null {
		return month.changes[key];
	}

	// 選択されたカテゴリの最大値
	const selectedCategoryMax = $derived(
		Math.max(...data.monthlyAssets.map(d => getCategoryValue(d, selectedCategory)), 1)
	);
</script>

<svelte:head>
	<title>月次資産比較 - 家計簿アプリ</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6">
	<!-- ヘッダー -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
			月次資産比較
		</h1>
		<p class="text-slate-500 mt-1">カテゴリ別資産推移をグラフで確認</p>
	</div>

	{#if data.monthlyAssets.length === 0}
		<div class="bg-white/80 backdrop-blur rounded-2xl p-12 border border-slate-200/50 text-center shadow-xl">
			<div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
				<Icon name="bank" size={40} class="text-indigo-400" />
			</div>
			<p class="text-xl text-slate-600 font-medium">データがありません</p>
			<p class="text-slate-400 mt-2">月次資産ページでデータを追加してください</p>
		</div>
	{:else}
		<!-- 最新月サマリー -->
		{#if latestMonth}
			<div class="bg-gradient-to-r from-slate-100 via-white to-slate-100 rounded-2xl p-6 mb-6 shadow-lg border border-slate-200">
				<div class="text-center mb-4">
					<p class="text-slate-500 text-sm">{formatMonth(latestMonth.recordDate)} 総資産</p>
					<p class="text-4xl font-bold text-indigo-600">{formatCurrency(latestMonth.total)}</p>
					{#if latestMonth.changes.total !== null}
						<p class="text-sm mt-1 {latestMonth.changes.total >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
							前月比 {formatPercent(latestMonth.changes.total)}
						</p>
					{/if}
				</div>
			</div>

			<!-- カテゴリ別サマリー -->
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
				<div class="{categoryColors.cash.bg} rounded-xl p-3 border border-emerald-200">
					<p class="text-xs text-slate-500">現金</p>
					<p class="text-lg font-bold {categoryColors.cash.text}">{formatCurrency(latestMonth.cash)}</p>
					{#if latestMonth.changes.cash !== null}
						<p class="text-xs {latestMonth.changes.cash >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
							{formatPercent(latestMonth.changes.cash)}
						</p>
					{/if}
				</div>
				<div class="{categoryColors.points.bg} rounded-xl p-3 border border-blue-200">
					<p class="text-xs text-slate-500">ポイント</p>
					<p class="text-lg font-bold {categoryColors.points.text}">{formatCurrency(latestMonth.points)}</p>
					{#if latestMonth.changes.points !== null}
						<p class="text-xs {latestMonth.changes.points >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
							{formatPercent(latestMonth.changes.points)}
						</p>
					{/if}
				</div>
				<div class="{categoryColors.realAssets.bg} rounded-xl p-3 border border-amber-200">
					<p class="text-xs text-slate-500">現物資産</p>
					<p class="text-lg font-bold {categoryColors.realAssets.text}">{formatCurrency(latestMonth.realAssets)}</p>
					{#if latestMonth.changes.realAssets !== null}
						<p class="text-xs {latestMonth.changes.realAssets >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
							{formatPercent(latestMonth.changes.realAssets)}
						</p>
					{/if}
				</div>
				<div class="{categoryColors.securities.bg} rounded-xl p-3 border border-purple-200">
					<p class="text-xs text-slate-500">証券会社</p>
					<p class="text-lg font-bold {categoryColors.securities.text}">{formatCurrency(latestMonth.securities)}</p>
					{#if latestMonth.changes.securities !== null}
						<p class="text-xs {latestMonth.changes.securities >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
							{formatPercent(latestMonth.changes.securities)}
						</p>
					{/if}
				</div>
				<div class="{categoryColors.crypto.bg} rounded-xl p-3 border border-orange-200">
					<p class="text-xs text-slate-500">仮想通貨</p>
					<p class="text-lg font-bold {categoryColors.crypto.text}">{formatCurrency(latestMonth.crypto)}</p>
					{#if latestMonth.changes.crypto !== null}
						<p class="text-xs {latestMonth.changes.crypto >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
							{formatPercent(latestMonth.changes.crypto)}
						</p>
					{/if}
				</div>
			</div>
		{/if}

		<!-- 積み上げ棒グラフ -->
		<section class="bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-200/50 shadow-xl mb-6">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg">
					<Icon name="chart-up" size={20} class="text-white" />
				</div>
				<h2 class="text-xl font-bold text-slate-800">資産推移（積み上げ）</h2>
			</div>

			<!-- 凡例 -->
			<div class="flex flex-wrap gap-3 mb-4 text-xs">
				<div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-gradient-to-r from-emerald-500 to-teal-400"></div><span>現金</span></div>
				<div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-indigo-400"></div><span>ポイント</span></div>
				<div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-gradient-to-r from-amber-500 to-yellow-400"></div><span>現物資産</span></div>
				<div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-violet-400"></div><span>証券会社</span></div>
				<div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-gradient-to-r from-orange-500 to-red-400"></div><span>仮想通貨</span></div>
			</div>

			<div class="overflow-x-auto">
				<div class="flex items-end gap-3 min-w-max pb-4" style="height: 280px;">
					{#each data.monthlyAssets as month}
						<div class="flex flex-col items-center gap-1 w-20">
							<span class="text-xs text-slate-600 font-bold">{formatCurrency(month.total)}</span>
							<div class="w-12 flex flex-col-reverse" style="height: {getBarHeight(month.total, maxTotal)}px">
								{#each getStackedData(month) as cat}
									{#if cat.value > 0}
										<div
											class="w-full bg-gradient-to-t {categoryColors[cat.key as keyof typeof categoryColors].bar} first:rounded-b last:rounded-t"
											style="height: {(cat.value / month.total) * 100}%"
											title="{cat.label}: {formatCurrency(cat.value)}"
										></div>
									{/if}
								{/each}
							</div>
							<span class="text-xs text-slate-600 font-medium">{formatShortMonth(month.recordDate)}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- カテゴリ別推移グラフ（大きな1つのグラフ） -->
		<section class="bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-200/50 shadow-xl mb-6">
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg">
						<Icon name="list" size={20} class="text-white" />
					</div>
					<h2 class="text-xl font-bold text-slate-800">カテゴリ別推移</h2>
				</div>
				<!-- カテゴリ選択プルダウン -->
				<select
					bind:value={selectedCategory}
					class="px-4 py-2 bg-white border-2 {selectedCategoryInfo.borderColor} rounded-lg font-medium {selectedCategoryInfo.textColor} focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all cursor-pointer"
				>
					{#each categoryOptions as option}
						<option value={option.key}>{option.label}</option>
					{/each}
				</select>
			</div>

			<!-- 選択されたカテゴリのサマリー -->
			{#if latestMonth}
				<div class="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 mb-6 border {selectedCategoryInfo.borderColor}">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm text-slate-500">{formatMonth(latestMonth.recordDate)} {selectedCategoryInfo.label}</p>
							<p class="text-3xl font-bold {selectedCategoryInfo.textColor}">{formatCurrency(getCategoryValue(latestMonth, selectedCategory))}</p>
						</div>
						{#if getCategoryChange(latestMonth, selectedCategory) !== null}
							<div class="text-right">
								<p class="text-sm text-slate-500">前月比</p>
								<p class="text-2xl font-bold {getCategoryChange(latestMonth, selectedCategory)! >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
									{formatPercent(getCategoryChange(latestMonth, selectedCategory))}
								</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- 大きな棒グラフ -->
			<div class="overflow-x-auto">
				<div class="flex items-end gap-4 min-w-max pb-4" style="height: 320px;">
					{#each data.monthlyAssets as month, i}
						{@const value = getCategoryValue(month, selectedCategory)}
						{@const change = getCategoryChange(month, selectedCategory)}
						{@const barHeight = getBarHeight(value, selectedCategoryMax)}
						<div class="flex flex-col items-center gap-2 min-w-[80px]">
							<!-- 金額表示 -->
							<div class="text-center">
								<span class="text-sm font-bold {selectedCategoryInfo.textColor}">
									{value >= 10000 ? `${Math.round(value / 10000)}万` : `${Math.round(value / 1000)}K`}
								</span>
								{#if change !== null}
									<div class="text-xs {change >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
										{formatPercent(change)}
									</div>
								{/if}
							</div>
							<!-- バー -->
							<div
								class="w-14 bg-gradient-to-t {selectedCategoryInfo.color} rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer shadow-md"
								style="height: {barHeight}px"
								title="{formatMonth(month.recordDate)}: {formatCurrency(value)}"
							></div>
							<!-- 月表示 -->
							<span class="text-sm font-medium text-slate-600">{formatShortMonth(month.recordDate)}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- データテーブル -->
		<section class="bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-200/50 shadow-xl">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center shadow-lg">
					<Icon name="report" size={20} class="text-white" />
				</div>
				<h2 class="text-xl font-bold text-slate-800">月次資産データ</h2>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-slate-200">
							<th class="text-left py-2 px-2 font-semibold text-slate-600">年月</th>
							<th class="text-right py-2 px-2 font-semibold text-emerald-600">現金</th>
							<th class="text-right py-2 px-2 font-semibold text-blue-600">ポイント</th>
							<th class="text-right py-2 px-2 font-semibold text-amber-600">現物資産</th>
							<th class="text-right py-2 px-2 font-semibold text-purple-600">証券会社</th>
							<th class="text-right py-2 px-2 font-semibold text-orange-600">仮想通貨</th>
							<th class="text-right py-2 px-2 font-semibold text-slate-800">合計</th>
						</tr>
					</thead>
					<tbody>
						{#each [...data.monthlyAssets].reverse() as month}
							<tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
								<td class="py-2 px-2">
									<a href="/monthly-assets?month={month.recordDate}" class="text-indigo-600 hover:text-indigo-800 font-medium">
										{formatMonth(month.recordDate)}
									</a>
								</td>
								<td class="py-2 px-2 text-right">
									<div class="text-emerald-600 font-medium">{formatCurrency(month.cash)}</div>
									{#if month.changes.cash !== null}
										<div class="text-xs {month.changes.cash >= 0 ? 'text-emerald-500' : 'text-rose-500'}">
											{formatPercent(month.changes.cash)}
										</div>
									{/if}
								</td>
								<td class="py-2 px-2 text-right">
									<div class="text-blue-600 font-medium">{formatCurrency(month.points)}</div>
									{#if month.changes.points !== null}
										<div class="text-xs {month.changes.points >= 0 ? 'text-emerald-500' : 'text-rose-500'}">
											{formatPercent(month.changes.points)}
										</div>
									{/if}
								</td>
								<td class="py-2 px-2 text-right">
									<div class="text-amber-600 font-medium">{formatCurrency(month.realAssets)}</div>
									{#if month.changes.realAssets !== null}
										<div class="text-xs {month.changes.realAssets >= 0 ? 'text-emerald-500' : 'text-rose-500'}">
											{formatPercent(month.changes.realAssets)}
										</div>
									{/if}
								</td>
								<td class="py-2 px-2 text-right">
									<div class="text-purple-600 font-medium">{formatCurrency(month.securities)}</div>
									{#if month.changes.securities !== null}
										<div class="text-xs {month.changes.securities >= 0 ? 'text-emerald-500' : 'text-rose-500'}">
											{formatPercent(month.changes.securities)}
										</div>
									{/if}
								</td>
								<td class="py-2 px-2 text-right">
									<div class="text-orange-600 font-medium">{formatCurrency(month.crypto)}</div>
									{#if month.changes.crypto !== null}
										<div class="text-xs {month.changes.crypto >= 0 ? 'text-emerald-500' : 'text-rose-500'}">
											{formatPercent(month.changes.crypto)}
										</div>
									{/if}
								</td>
								<td class="py-2 px-2 text-right">
									<div class="text-slate-800 font-bold">{formatCurrency(month.total)}</div>
									{#if month.changes.total !== null}
										<div class="text-xs {month.changes.total >= 0 ? 'text-emerald-500' : 'text-rose-500'}">
											{formatPercent(month.changes.total)}
										</div>
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
