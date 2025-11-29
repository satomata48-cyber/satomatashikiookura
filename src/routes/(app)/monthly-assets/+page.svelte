<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';

	let { data } = $props();

	let newItem = $state({ category: '', name: '', amount: '', memo: '' });
	let newCrypto = $state({ name: '', quantity: '', usd_price: '', jpy_rate: '150', memo: '' });

	// カテゴリ定義（仮想通貨を除外）
	const categories = ['現金', 'ポイント', '現物資産', '証券会社資産'];

	// カテゴリごとの色
	const categoryColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
		'現金': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', accent: 'bg-emerald-500' },
		'ポイント': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', accent: 'bg-blue-500' },
		'現物資産': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', accent: 'bg-amber-500' },
		'証券会社資産': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', accent: 'bg-purple-500' },
		'仮想通貨資産': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', accent: 'bg-orange-500' }
	};

	function getCategoryColor(category: string) {
		return categoryColors[category] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', accent: 'bg-slate-500' };
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY'
		}).format(amount);
	}

	function formatNumber(num: number, decimals: number = 2): string {
		return num.toLocaleString('ja-JP', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
	}

	function formatMonth(monthStr: string): string {
		const [year, month] = monthStr.split('-');
		return `${year}年${parseInt(month)}月`;
	}

	// 仮想通貨の円換算額を計算
	function calcCryptoJpy(quantity: number, usdPrice: number, jpyRate: number): number {
		return Math.round(quantity * usdPrice * jpyRate);
	}

	// カテゴリごとにグループ化
	const itemsByCategory = $derived(() => {
		const groups: Record<string, typeof data.assetItems> = {};
		categories.forEach(cat => {
			groups[cat] = [];
		});
		data.assetItems.forEach(item => {
			if (groups[item.category]) {
				groups[item.category].push(item);
			} else {
				groups[item.category] = [item];
			}
		});
		return groups;
	});

	// カテゴリごとの合計
	function getCategoryTotal(category: string): number {
		return data.assetItems
			.filter(item => item.category === category)
			.reduce((sum, item) => sum + item.amount, 0);
	}

	// 仮想通貨合計
	const totalCrypto = $derived(
		data.cryptoAssets.reduce((sum, c) => sum + calcCryptoJpy(c.quantity, c.usd_price, c.jpy_rate), 0)
	);

	// 総資産（通常資産 + 仮想通貨）
	const totalAssets = $derived(
		data.assetItems.reduce((sum, item) => sum + item.amount, 0) + totalCrypto
	);

	function handleMonthChange(event: Event) {
		const target = event.target as HTMLInputElement;
		goto(`/monthly-assets?month=${target.value}`);
	}

	function navigateMonth(offset: number) {
		if (!data.selectedMonth) return;
		const [year, month] = data.selectedMonth.split('-').map(Number);
		const newDate = new Date(year, month - 1 + offset, 1);
		const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
		goto(`/monthly-assets?month=${newMonth}`);
	}
</script>

<svelte:head>
	<title>月次資産 - 家計簿アプリ</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
	<!-- ヘッダー（月選択） -->
	<div class="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6 border border-slate-200/50 shadow-lg">
		<div class="flex items-center justify-between">
			<button
				onclick={() => navigateMonth(-1)}
				class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
			>
				<Icon name="chart-down" size={20} class="text-slate-600 rotate-90" />
			</button>
			<div class="flex items-center gap-3">
				<input
					type="month"
					value={data.selectedMonth || ''}
					onchange={handleMonthChange}
					class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-300"
				/>
				{#if data.selectedMonth}
					<span class="text-xl font-bold text-indigo-600">{formatMonth(data.selectedMonth)}</span>
				{/if}
			</div>
			<button
				onclick={() => navigateMonth(1)}
				class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
			>
				<Icon name="chart-up" size={20} class="text-slate-600 rotate-90" />
			</button>
		</div>
	</div>

	{#if !data.currentRecord}
		<div class="bg-white/80 backdrop-blur rounded-2xl p-12 border border-slate-200/50 text-center shadow-xl">
			<div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
				<Icon name="bank" size={40} class="text-indigo-400" />
			</div>
			<p class="text-xl text-slate-600 font-medium">{data.selectedMonth ? formatMonth(data.selectedMonth) : '選択した月'}のデータがありません</p>
			<form method="POST" action="?/createRecord" use:enhance class="mt-4">
				<input type="hidden" name="record_date" value={data.selectedMonth || new Date().toISOString().slice(0, 7)} />
				<button type="submit" class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 font-medium shadow-lg shadow-indigo-200">
					この月のデータを作成
				</button>
			</form>
		</div>
	{:else}
		<!-- 総資産サマリー -->
		<div class="bg-gradient-to-r from-slate-100 via-white to-slate-100 rounded-2xl p-6 mb-6 shadow-lg border border-slate-200">
			<div class="text-center">
				<p class="text-slate-500 text-sm mb-1">総資産</p>
				<p class="text-4xl font-bold text-indigo-600">{formatCurrency(totalAssets)}</p>
			</div>
		</div>

		<!-- カテゴリ別サマリー -->
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
			{#each categories as category}
				{@const color = getCategoryColor(category)}
				{@const total = getCategoryTotal(category)}
				<div class="{color.bg} backdrop-blur rounded-2xl p-4 border {color.border} shadow-lg">
					<p class="text-xs text-slate-500 mb-1">{category}合計</p>
					<p class="text-xl font-bold {color.text}">{formatCurrency(total)}</p>
				</div>
			{/each}
			<!-- 仮想通貨合計 -->
			<div class="bg-orange-50 backdrop-blur rounded-2xl p-4 border border-orange-200 shadow-lg">
				<p class="text-xs text-slate-500 mb-1">仮想通貨資産合計</p>
				<p class="text-xl font-bold text-orange-600">{formatCurrency(totalCrypto)}</p>
			</div>
		</div>

		<!-- カテゴリ別資産リスト（2カラム）-->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
			{#each categories as category}
				{@const color = getCategoryColor(category)}
				{@const items = itemsByCategory()[category] || []}
				{#if items.length > 0}
					<section class="bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200/50 shadow-lg">
						<div class="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
							<div class="w-7 h-7 {color.accent} rounded-lg flex items-center justify-center">
								<Icon name="wallet" size={14} class="text-white" />
							</div>
							<h2 class="text-base font-bold text-slate-800">{category}</h2>
							<span class="ml-auto text-base font-bold {color.text}">{formatCurrency(getCategoryTotal(category))}</span>
						</div>

						<div class="space-y-0.5">
							{#each items as item}
								<div class="flex items-center gap-1 {color.bg} rounded px-2 py-1 border {color.border}">
									<span class="text-sm font-medium text-slate-800 min-w-0 truncate flex-1">{item.name}</span>
									<form method="POST" action="?/updateItem" use:enhance class="flex items-center gap-0.5">
										<input type="hidden" name="item_id" value={item.id} />
										<span class="text-slate-400 text-xs">¥</span>
										<input
											type="number"
											name="amount"
											value={item.amount}
											class="w-20 px-1 py-0.5 bg-white border border-slate-200 rounded text-right text-xs font-bold focus:ring-1 focus:ring-indigo-300"
										/>
										<button type="submit" class="p-0.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200">
											<Icon name="check" size={12} />
										</button>
									</form>
									<form method="POST" action="?/deleteItem" use:enhance>
										<input type="hidden" name="item_id" value={item.id} />
										<button type="submit" class="p-0.5 bg-red-100 text-red-600 rounded hover:bg-red-200">
											<Icon name="minus" size={12} />
										</button>
									</form>
								</div>
							{/each}
						</div>
					</section>
				{/if}
			{/each}

		</div>

		<!-- 仮想通貨資産セクション（フル幅） -->
		<section class="mt-4 bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200/50 shadow-lg">
			<div class="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
				<div class="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
					<Icon name="investment" size={14} class="text-white" />
				</div>
				<h2 class="text-base font-bold text-slate-800">仮想通貨資産</h2>
				<span class="ml-auto text-base font-bold text-orange-600">{formatCurrency(totalCrypto)}</span>
			</div>

			{#if data.cryptoAssets.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
					{#each data.cryptoAssets as crypto}
						{@const jpyValue = calcCryptoJpy(crypto.quantity, crypto.usd_price, crypto.jpy_rate)}
						<div class="bg-orange-50 rounded-lg p-2 border border-orange-200 relative">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-bold text-slate-800">{crypto.name}</span>
								<span class="text-sm font-bold text-orange-600">{formatCurrency(jpyValue)}</span>
							</div>
							<form method="POST" action="?/updateCrypto" use:enhance class="flex items-center gap-1">
								<input type="hidden" name="crypto_id" value={crypto.id} />
								<input
									type="number"
									name="quantity"
									step="0.00000001"
									value={crypto.quantity}
									class="w-16 px-1 py-0.5 bg-white border border-slate-200 rounded text-right text-xs focus:ring-1 focus:ring-orange-300"
									title="数量"
								/>
								<span class="text-slate-400 text-xs">×$</span>
								<input
									type="number"
									name="usd_price"
									step="0.01"
									value={crypto.usd_price}
									class="w-14 px-1 py-0.5 bg-white border border-slate-200 rounded text-right text-xs focus:ring-1 focus:ring-orange-300"
									title="USD価格"
								/>
								<span class="text-slate-400 text-xs">×¥</span>
								<input
									type="number"
									name="jpy_rate"
									step="0.01"
									value={crypto.jpy_rate}
									class="w-12 px-1 py-0.5 bg-white border border-slate-200 rounded text-right text-xs focus:ring-1 focus:ring-orange-300"
									title="為替"
								/>
								<button type="submit" class="p-0.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200" title="更新">
									<Icon name="check" size={12} />
								</button>
							</form>
							<form method="POST" action="?/deleteCrypto" use:enhance class="absolute top-1 right-1">
								<input type="hidden" name="crypto_id" value={crypto.id} />
								<button type="submit" class="p-0.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="削除">
									<Icon name="minus" size={10} />
								</button>
							</form>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-slate-400 text-center py-2 text-sm">仮想通貨データがありません</p>
			{/if}

			<!-- 仮想通貨追加フォーム -->
			<div class="mt-3 pt-3 border-t border-slate-200">
				<form method="POST" action="?/addCrypto" use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							newCrypto = { name: '', quantity: '', usd_price: '', jpy_rate: '150', memo: '' };
						}
					};
				}} class="flex flex-wrap items-center gap-2">
					<input type="hidden" name="record_id" value={data.currentRecord.id} />
					<select
						bind:value={newCrypto.name}
						onchange={(e) => {
							const target = e.target as HTMLSelectElement;
							if (target.value === '__new__') {
								newCrypto.name = '';
							} else {
								const existing = (data.existingCryptos || []).find(c => c.name === target.value);
								if (existing?.memo) {
									newCrypto.memo = existing.memo;
								}
							}
						}}
						class="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-300"
					>
						<option value="">既存から選択</option>
						{#each data.existingCryptos || [] as crypto}
							<option value={crypto.name}>{crypto.name}{crypto.memo ? ` (${crypto.memo})` : ''}</option>
						{/each}
						<option value="__new__">＋新規入力</option>
					</select>
					<input type="hidden" name="name" value={newCrypto.name} />
					{#if newCrypto.name === '' || newCrypto.name === '__new__'}
						<input
							type="text"
							bind:value={newCrypto.name}
							placeholder="通貨名"
							class="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-300"
						/>
					{/if}
					<input
						type="number"
						name="quantity"
						step="0.00000001"
						bind:value={newCrypto.quantity}
						placeholder="数量"
						class="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-300"
					/>
					<div class="flex items-center gap-1">
						<span class="text-slate-400 text-xs">$</span>
						<input
							type="number"
							name="usd_price"
							step="0.01"
							bind:value={newCrypto.usd_price}
							placeholder="USD"
							class="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-300"
						/>
					</div>
					<div class="flex items-center gap-1">
						<span class="text-slate-400 text-xs">¥</span>
						<input
							type="number"
							name="jpy_rate"
							step="0.01"
							bind:value={newCrypto.jpy_rate}
							placeholder="為替"
							class="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-300"
						/>
					</div>
					<input
						type="text"
						name="memo"
						bind:value={newCrypto.memo}
						placeholder="メモ"
						class="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-orange-300"
					/>
					<button type="submit" class="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded text-sm font-medium hover:from-orange-600 hover:to-amber-600">
						追加
					</button>
				</form>
			</div>
		</section>

		<!-- 新規アイテム追加 -->
		<section class="mt-4 bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200/50 shadow-lg">
			<h2 class="text-sm font-bold text-slate-800 mb-2">新しい資産を追加</h2>
			<form method="POST" action="?/addItem" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						newItem = { category: '', name: '', amount: '', memo: '' };
					}
				};
			}} class="flex flex-wrap items-center gap-2">
				<input type="hidden" name="record_id" value={data.currentRecord.id} />
				<select
					name="category"
					bind:value={newItem.category}
					onchange={() => newItem.name = ''}
					class="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-300"
					required
				>
					<option value="">カテゴリ</option>
					{#each categories as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
				<select
					bind:value={newItem.name}
					onchange={(e) => {
						const target = e.target as HTMLSelectElement;
						if (target.value === '__new__') {
							newItem.name = '';
						}
					}}
					class="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-300"
				>
					<option value="">既存から選択</option>
					{#each (data.existingItems || []).filter(i => i.category === newItem.category) as item}
						<option value={item.name}>{item.name}</option>
					{/each}
					<option value="__new__">＋新規入力</option>
				</select>
				<input type="hidden" name="name" value={newItem.name} />
				{#if newItem.name === '' || newItem.name === '__new__'}
					<input
						type="text"
						bind:value={newItem.name}
						placeholder="資産名を入力"
						class="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-300"
					/>
				{/if}
				<div class="flex items-center gap-1">
					<span class="text-slate-400 text-xs">¥</span>
					<input
						type="number"
						name="amount"
						bind:value={newItem.amount}
						placeholder="金額"
						class="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-300"
					/>
				</div>
				<input
					type="text"
					name="memo"
					bind:value={newItem.memo}
					placeholder="メモ"
					class="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-300"
				/>
				<button type="submit" class="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded text-sm font-medium hover:from-emerald-600 hover:to-teal-600">
					追加
				</button>
			</form>
		</section>
	{/if}
</div>
