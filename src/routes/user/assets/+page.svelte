<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	// モックデータ
	const assets = [
		{ id: 1, name: 'みずほ銀行 普通預金', type: '預金', amount: 850000, icon: 'bank' },
		{ id: 2, name: 'ゆうちょ銀行', type: '預金', amount: 320000, icon: 'bank' },
		{ id: 3, name: '現金', type: '現金', amount: 80000, icon: 'wallet' },
		{ id: 4, name: '投資信託（eMAXIS Slim）', type: '投資', amount: 450000, icon: 'investment' },
		{ id: 5, name: '国内株式', type: '投資', amount: 280000, icon: 'chart-up' },
		{ id: 6, name: '米国株式', type: '投資', amount: 120000, icon: 'chart-up' }
	];

	const totalCash = assets.filter(a => a.type === '現金' || a.type === '預金').reduce((sum, a) => sum + a.amount, 0);
	const totalInvestment = assets.filter(a => a.type === '投資').reduce((sum, a) => sum + a.amount, 0);
	const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY'
		}).format(amount);
	}
</script>

<svelte:head>
	<title>資産管理 - 家計簿アプリ</title>
</svelte:head>

<div class="p-6">
	<!-- ページタイトル -->
	<div class="flex justify-between items-center mb-6">
		<div>
			<h1 class="text-2xl font-bold text-slate-800">資産管理</h1>
			<p class="text-slate-500">保有資産を管理・確認できます</p>
		</div>
		<button
			class="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
		>
			<Icon name="plus" size={20} />
			<span>資産を追加</span>
		</button>
	</div>

	<!-- サマリー -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
		<div class="bg-white rounded-xl p-6 border border-slate-200">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-slate-500">現金・預金</p>
					<p class="text-2xl font-bold text-blue-500">
						{formatCurrency(totalCash)}
					</p>
				</div>
				<div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
					<Icon name="bank" size={24} />
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl p-6 border border-slate-200">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-slate-500">投資資産</p>
					<p class="text-2xl font-bold text-purple-500">
						{formatCurrency(totalInvestment)}
					</p>
				</div>
				<div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
					<Icon name="investment" size={24} />
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl p-6 border border-slate-200">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-slate-500">総資産</p>
					<p class="text-2xl font-bold text-emerald-500">
						{formatCurrency(totalAssets)}
					</p>
				</div>
				<div class="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
					<Icon name="sparkle" size={24} />
				</div>
			</div>
		</div>
	</div>

	<!-- 資産リスト -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- 現金・預金 -->
		<section class="bg-white rounded-xl p-6 border border-slate-200">
			<h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
				<Icon name="bank" size={20} class="text-blue-500" />
				現金・預金
			</h2>
			<div class="space-y-3">
				{#each assets.filter(a => a.type === '現金' || a.type === '預金') as asset}
					<div class="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
								<Icon name={asset.icon} size={20} />
							</div>
							<div>
								<p class="font-medium text-slate-800">{asset.name}</p>
								<p class="text-sm text-slate-500">{asset.type}</p>
							</div>
						</div>
						<span class="text-lg font-bold text-slate-800">
							{formatCurrency(asset.amount)}
						</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- 投資資産 -->
		<section class="bg-white rounded-xl p-6 border border-slate-200">
			<h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
				<Icon name="investment" size={20} class="text-purple-500" />
				投資資産
			</h2>
			<div class="space-y-3">
				{#each assets.filter(a => a.type === '投資') as asset}
					<div class="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
								<Icon name={asset.icon} size={20} />
							</div>
							<div>
								<p class="font-medium text-slate-800">{asset.name}</p>
								<p class="text-sm text-slate-500">{asset.type}</p>
							</div>
						</div>
						<span class="text-lg font-bold text-slate-800">
							{formatCurrency(asset.amount)}
						</span>
					</div>
				{/each}
			</div>
		</section>
	</div>
</div>
