<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	let { data } = $props();

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY'
		}).format(amount);
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return `${date.getMonth() + 1}/${date.getDate()}`;
	}

	// カテゴリに応じたアイコン名を返す
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

	// グラフの最大値を計算
	const maxValue = $derived(
		Math.max(...data.monthlyData.flatMap((d) => [d.income, d.expense]), 1)
	);
</script>

<svelte:head>
	<title>ダッシュボード - 家計簿アプリ</title>
</svelte:head>

<div class="p-6">
	<!-- ページタイトル -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-slate-800">ダッシュボード</h1>
		<p class="text-slate-500">今月の収支と資産状況を確認できます</p>
	</div>

	<!-- 今月のサマリー -->
	<section class="mb-8">
		<h2 class="text-lg font-bold text-slate-800 mb-4">今月の収支</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="bg-white rounded-xl p-6 border border-slate-200">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">収入</p>
						<p class="text-2xl font-bold text-emerald-500">
							{formatCurrency(data.summary.income)}
						</p>
					</div>
					<div class="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
						<Icon name="chart-up" size={24} />
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl p-6 border border-slate-200">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">支出</p>
						<p class="text-2xl font-bold text-red-500">
							{formatCurrency(data.summary.expense)}
						</p>
					</div>
					<div class="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
						<Icon name="chart-down" size={24} />
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl p-6 border border-slate-200">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">収支バランス</p>
						<p
							class="text-2xl font-bold"
							class:text-emerald-500={data.summary.balance >= 0}
							class:text-red-500={data.summary.balance < 0}
						>
							{formatCurrency(data.summary.balance)}
						</p>
					</div>
					<div
						class="w-12 h-12 rounded-lg flex items-center justify-center"
						class:bg-emerald-50={data.summary.balance >= 0}
						class:text-emerald-500={data.summary.balance >= 0}
						class:bg-red-50={data.summary.balance < 0}
						class:text-red-500={data.summary.balance < 0}
					>
						{#if data.summary.balance >= 0}
							<Icon name="sparkle" size={24} />
						{:else}
							<Icon name="warning" size={24} />
						{/if}
					</div>
				</div>
			</div>
		</div>
	</section>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- 月次推移グラフ -->
		<section class="bg-white rounded-xl p-6 border border-slate-200">
			<h2 class="text-lg font-bold text-slate-800 mb-4">月次推移（過去6ヶ月）</h2>
			<div class="space-y-4">
				{#each data.monthlyData as month}
					<div>
						<div class="flex justify-between text-sm text-slate-600 mb-1">
							<span>{month.month}</span>
							<span>
								<span class="text-emerald-500">+{formatCurrency(month.income)}</span>
								/
								<span class="text-red-500">-{formatCurrency(month.expense)}</span>
							</span>
						</div>
						<div class="flex gap-1 h-6">
							<div
								class="bg-emerald-500 rounded-l"
								style="width: {(month.income / maxValue) * 100}%"
							></div>
							<div
								class="bg-red-500 rounded-r"
								style="width: {(month.expense / maxValue) * 100}%"
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

		<!-- 資産状況 -->
		<section class="bg-white rounded-xl p-6 border border-slate-200">
			<h2 class="text-lg font-bold text-slate-800 mb-4">資産状況</h2>
			<div class="space-y-4">
				<div class="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
							<Icon name="bank" size={20} />
						</div>
						<span class="text-slate-700">現金・預金</span>
					</div>
					<span class="text-lg font-bold text-slate-800">
						{formatCurrency(data.assets.cash)}
					</span>
				</div>

				<div class="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
							<Icon name="investment" size={20} />
						</div>
						<span class="text-slate-700">投資資産</span>
					</div>
					<span class="text-lg font-bold text-slate-800">
						{formatCurrency(data.assets.investment)}
					</span>
				</div>

				<div class="border-t border-slate-200 pt-4">
					<div class="flex justify-between items-center">
						<span class="text-slate-700 font-medium">総資産</span>
						<span class="text-2xl font-bold text-emerald-500">
							{formatCurrency(data.assets.total)}
						</span>
					</div>
				</div>
			</div>
		</section>
	</div>

	<!-- 最近の取引 -->
	<section class="mt-6 bg-white rounded-xl p-6 border border-slate-200">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-lg font-bold text-slate-800">最近の取引</h2>
			<a href="/transactions" class="text-emerald-500 hover:text-emerald-600 text-sm font-medium">
				すべて見る →
			</a>
		</div>
		{#if data.recentTransactions.length > 0}
			<div class="space-y-3">
				{#each data.recentTransactions as tx}
					<div class="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 rounded-lg flex items-center justify-center"
								class:bg-emerald-50={tx.type === 'income'}
								class:text-emerald-500={tx.type === 'income'}
								class:bg-red-50={tx.type === 'expense'}
								class:text-red-500={tx.type === 'expense'}
							>
								<Icon name={getCategoryIcon(tx.category_name)} size={20} />
							</div>
							<div>
								<p class="font-medium text-slate-800">{tx.category_name}</p>
								<p class="text-sm text-slate-500">
									{tx.description || '説明なし'} • {formatDate(tx.date)}
								</p>
							</div>
						</div>
						<span
							class="font-bold"
							class:text-emerald-500={tx.type === 'income'}
							class:text-red-500={tx.type === 'expense'}
						>
							{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
						</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-8 text-slate-500">
				<div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<Icon name="list" size={32} class="text-slate-400" />
				</div>
				<p>まだ取引がありません</p>
				<p class="text-sm">収支を記録して家計を管理しましょう</p>
			</div>
		{/if}
	</section>

	<!-- クイックアクション -->
	<section class="mt-6">
		<h2 class="text-lg font-bold text-slate-800 mb-4">クイックアクション</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<a
				href="/transactions/new"
				class="bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-center"
			>
				<div class="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 mx-auto mb-3">
					<Icon name="plus" size={24} />
				</div>
				<span class="text-slate-700 font-medium">収支を追加</span>
			</a>
			<a
				href="/transactions"
				class="bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-center"
			>
				<div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 mx-auto mb-3">
					<Icon name="list" size={24} />
				</div>
				<span class="text-slate-700 font-medium">取引一覧</span>
			</a>
			<a
				href="/assets"
				class="bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-center"
			>
				<div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 mx-auto mb-3">
					<Icon name="bank" size={24} />
				</div>
				<span class="text-slate-700 font-medium">資産管理</span>
			</a>
			<a
				href="/reports"
				class="bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-center"
			>
				<div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 mx-auto mb-3">
					<Icon name="report" size={24} />
				</div>
				<span class="text-slate-700 font-medium">レポート</span>
			</a>
		</div>
	</section>
</div>
