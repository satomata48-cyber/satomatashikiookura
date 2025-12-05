<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';

	let { data } = $props();

	let newItem = $state({ category: '', name: '', amount: '', memo: '' });
	let newCrypto = $state({ name: '', quantity: '', usd_price: '', jpy_rate: '150', memo: '' });
	let newGold = $state({ name: '', quantity: '', jpy_price: '', memo: '' });
	let copyFromPrevious = $state(true);
	let isCreating = $state(false);
	let isSaving = $state(false);
	let isSavingCrypto = $state(false);
	let isSavingGold = $state(false);

	// 編集用のローカルステート
	let editedItems = $state<Record<number, number>>({});
	let editedCryptos = $state<Record<number, { quantity: number; usd_price: number; jpy_rate: number }>>({});
	let editedGolds = $state<Record<number, { quantity: number; jpy_price: number }>>({});

	// 変更があるかどうか
	const hasItemChanges = $derived(Object.keys(editedItems).length > 0);
	const hasCryptoChanges = $derived(Object.keys(editedCryptos).length > 0);
	const hasGoldChanges = $derived(Object.keys(editedGolds).length > 0);
	const hasAnyChanges = $derived(hasItemChanges || hasCryptoChanges || hasGoldChanges);
	let isSavingAll = $state(false);

	// 全体一括保存
	async function saveAll() {
		if (!hasAnyChanges) return;
		isSavingAll = true;

		const promises = [];
		if (hasItemChanges) promises.push(saveAllItems());
		if (hasCryptoChanges) promises.push(saveAllCryptos());
		if (hasGoldChanges) promises.push(saveAllGolds());

		await Promise.all(promises);
		isSavingAll = false;
	}

	// アイテムの金額を取得（編集中の値があればそれを返す）
	function getItemAmount(item: { id: number; amount: number }): number {
		return editedItems[item.id] !== undefined ? editedItems[item.id] : item.amount;
	}

	// 仮想通貨の値を取得
	function getCryptoValue(crypto: { id: number; quantity: number; usd_price: number; jpy_rate: number }) {
		if (editedCryptos[crypto.id]) {
			return editedCryptos[crypto.id];
		}
		return { quantity: crypto.quantity, usd_price: crypto.usd_price, jpy_rate: crypto.jpy_rate };
	}

	// アイテムの金額を更新
	function updateItemAmount(id: number, amount: number) {
		editedItems[id] = amount;
	}

	// 仮想通貨の値を更新
	function updateCryptoValue(id: number, field: 'quantity' | 'usd_price' | 'jpy_rate', value: number) {
		const crypto = data.cryptoAssets.find(c => c.id === id);
		if (!crypto) return;

		if (!editedCryptos[id]) {
			editedCryptos[id] = { quantity: crypto.quantity, usd_price: crypto.usd_price, jpy_rate: crypto.jpy_rate };
		}
		editedCryptos[id][field] = value;
	}

	// ゴールドの値を取得
	function getGoldValue(gold: { id: number; quantity: number; jpy_price: number }) {
		if (editedGolds[gold.id]) {
			return editedGolds[gold.id];
		}
		return { quantity: gold.quantity, jpy_price: gold.jpy_price };
	}

	// ゴールドの値を更新
	function updateGoldValue(id: number, field: 'quantity' | 'jpy_price', value: number) {
		const gold = data.goldAssets.find(g => g.id === id);
		if (!gold) return;

		if (!editedGolds[id]) {
			editedGolds[id] = { quantity: gold.quantity, jpy_price: gold.jpy_price };
		}
		editedGolds[id][field] = value;
	}

	// 一括保存
	async function saveAllItems() {
		if (!hasItemChanges) return;
		isSaving = true;

		const updates = Object.entries(editedItems).map(([id, amount]) => ({
			id: parseInt(id),
			amount
		}));

		const formData = new FormData();
		formData.append('updates', JSON.stringify(updates));

		const response = await fetch('?/updateAllItems', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			editedItems = {};
			await invalidateAll();
		}
		isSaving = false;
	}

	// 仮想通貨一括保存
	async function saveAllCryptos() {
		if (!hasCryptoChanges) return;
		isSavingCrypto = true;

		const updates = Object.entries(editedCryptos).map(([id, values]) => ({
			id: parseInt(id),
			...values
		}));

		const formData = new FormData();
		formData.append('updates', JSON.stringify(updates));

		const response = await fetch('?/updateAllCryptos', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			editedCryptos = {};
			await invalidateAll();
		}
		isSavingCrypto = false;
	}

	// ゴールド一括保存
	async function saveAllGolds() {
		if (!hasGoldChanges) return;
		isSavingGold = true;

		const updates = Object.entries(editedGolds).map(([id, values]) => ({
			id: parseInt(id),
			...values
		}));

		const formData = new FormData();
		formData.append('updates', JSON.stringify(updates));

		const response = await fetch('?/updateAllGolds', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			editedGolds = {};
			await invalidateAll();
		}
		isSavingGold = false;
	}

	// ゴールドの円換算額を計算
	function calcGoldJpy(quantity: number, jpyPrice: number): number {
		return Math.round(quantity * jpyPrice);
	}

	// 編集後のカテゴリ合計を計算
	function getEditedCategoryTotal(category: string): number {
		return data.assetItems
			.filter(item => item.category === category)
			.reduce((sum, item) => sum + getItemAmount(item), 0);
	}

	// 編集後の仮想通貨合計を計算
	const editedTotalCrypto = $derived(
		data.cryptoAssets.reduce((sum, c) => {
			const values = getCryptoValue(c);
			return sum + calcCryptoJpy(values.quantity, values.usd_price, values.jpy_rate);
		}, 0)
	);

	// 編集後のゴールド合計を計算
	const editedTotalGold = $derived(
		data.goldAssets.reduce((sum, g) => {
			const values = getGoldValue(g);
			return sum + calcGoldJpy(values.quantity, values.jpy_price);
		}, 0)
	);

	// 編集後の総資産
	const editedTotalAssets = $derived(
		data.assetItems.reduce((sum, item) => sum + getItemAmount(item), 0) + editedTotalCrypto + editedTotalGold
	);

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

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6">
	<!-- ヘッダー（月選択） -->
	<div class="bg-white/80 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-200/50 shadow-lg">
		<div class="flex items-center justify-between gap-2 sm:gap-4">
			<button
				onclick={() => navigateMonth(-1)}
				class="p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
			>
				<Icon name="chart-down" size={20} class="text-slate-600 rotate-90" />
			</button>
			<div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-1 justify-center">
				<!-- プルダウンで月を選択 -->
				<select
					value={data.selectedMonth || ''}
					onchange={(e) => {
						const target = e.target as HTMLSelectElement;
						if (target.value) {
							goto(`/monthly-assets?month=${target.value}`);
						}
					}}
					class="px-3 sm:px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-base sm:text-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-300 min-w-0 w-full sm:w-auto sm:min-w-40"
				>
					{#if !data.selectedMonth || !data.assetRecords.find(r => r.record_date === data.selectedMonth)}
						<option value={data.selectedMonth || ''}>{data.selectedMonth ? formatMonth(data.selectedMonth) : '月を選択'}</option>
					{/if}
					{#each data.assetRecords as record}
						<option value={record.record_date}>{formatMonth(record.record_date)}</option>
					{/each}
				</select>
				<!-- 新規月作成用のinput -->
				<input
					type="month"
					value={data.selectedMonth || ''}
					onchange={handleMonthChange}
					class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-indigo-300 w-full sm:w-36"
					title="新しい月を選択"
				/>
			</div>
			<button
				onclick={() => navigateMonth(1)}
				class="p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
			>
				<Icon name="chart-up" size={20} class="text-slate-600 rotate-90" />
			</button>
		</div>
	</div>

	{#if !data.currentRecord}
		<div class="bg-white/80 backdrop-blur rounded-2xl p-8 border border-slate-200/50 text-center shadow-xl">
			<div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
				<Icon name="bank" size={40} class="text-indigo-400" />
			</div>
			<p class="text-xl text-slate-600 font-medium mb-4">{data.selectedMonth ? formatMonth(data.selectedMonth) : '選択した月'}のデータがありません</p>

			<form
				method="POST"
				action="?/createFromPrevious"
				use:enhance={() => {
					isCreating = true;
					return async ({ update }) => {
						await update();
						isCreating = false;
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="new_month" value={data.selectedMonth || new Date().toISOString().slice(0, 7)} />

				{#if data.latestRecord}
					<div class="flex items-center justify-center gap-2">
						<input
							type="checkbox"
							id="copy_previous"
							bind:checked={copyFromPrevious}
							class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
						/>
						<label for="copy_previous" class="text-sm text-slate-700">
							{formatMonth(data.latestRecord.record_date)}のデータをコピー
						</label>
					</div>
					{#if copyFromPrevious}
						<input type="hidden" name="source_record_id" value={data.latestRecord.id} />
					{/if}
				{/if}

				<button
					type="submit"
					disabled={isCreating}
					class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl
						hover:from-indigo-600 hover:to-purple-600 font-medium shadow-lg shadow-indigo-200
						disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
				>
					{#if isCreating}
						<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10" class="opacity-25" />
							<path d="M4 12a8 8 0 018-8" class="opacity-75" />
						</svg>
						<span>作成中...</span>
					{:else}
						<span>この月のデータを作成</span>
					{/if}
				</button>
			</form>
		</div>
	{:else}
		<!-- 総資産サマリー -->
		<div class="bg-gradient-to-r from-slate-100 via-white to-slate-100 rounded-2xl p-6 mb-6 shadow-lg border border-slate-200">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					{#if data.previousRecord}
						<form
							method="POST"
							action="?/copyFromPrevious"
							use:enhance={() => {
								if (!confirm(`${formatMonth(data.previousRecord.record_date)}のデータで上書きしますか？\n現在のデータは削除されます。`)) {
									return () => {};
								}
								return async ({ update }) => {
									await update();
								};
							}}
						>
							<input type="hidden" name="current_record_id" value={data.currentRecord.id} />
							<input type="hidden" name="source_record_id" value={data.previousRecord.id} />
							<button
								type="submit"
								class="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg
									hover:from-amber-600 hover:to-orange-600 transition-all shadow-md flex items-center gap-2"
							>
								<Icon name="chart-down" size={14} />
								<span>{formatMonth(data.previousRecord.record_date)}を反映</span>
							</button>
						</form>
					{/if}
				</div>
				<div class="text-center flex-1">
					<p class="text-slate-500 text-sm mb-1">総資産</p>
					<p class="text-4xl font-bold text-indigo-600">{formatCurrency(editedTotalAssets)}</p>
				</div>
				<div class="flex-1 flex justify-end">
					{#if hasAnyChanges}
						<button
							onclick={saveAll}
							disabled={isSavingAll}
							class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl
								hover:from-indigo-600 hover:to-purple-600 font-medium shadow-lg shadow-indigo-200
								disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{#if isSavingAll}
								<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<circle cx="12" cy="12" r="10" class="opacity-25" />
									<path d="M4 12a8 8 0 018-8" class="opacity-75" />
								</svg>
								<span>保存中...</span>
							{:else}
								<Icon name="check" size={18} />
								<span>全て保存</span>
							{/if}
						</button>
					{/if}
				</div>
			</div>
		</div>

		<!-- カテゴリ別サマリー -->
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
			{#each categories as category}
				{@const color = getCategoryColor(category)}
				{@const total = category === '現物資産' ? getEditedCategoryTotal(category) + editedTotalGold : getEditedCategoryTotal(category)}
				<div class="{color.bg} backdrop-blur rounded-2xl p-4 border {color.border} shadow-lg">
					<p class="text-xs text-slate-500 mb-1">{category}合計</p>
					<p class="text-xl font-bold {color.text}">{formatCurrency(total)}</p>
				</div>
			{/each}
			<!-- 仮想通貨合計 -->
			<div class="bg-orange-50 backdrop-blur rounded-2xl p-4 border border-orange-200 shadow-lg">
				<p class="text-xs text-slate-500 mb-1">仮想通貨資産合計</p>
				<p class="text-xl font-bold text-orange-600">{formatCurrency(editedTotalCrypto)}</p>
			</div>
		</div>

		<!-- カテゴリ別資産リスト（2カラム）-->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
			{#each categories as category}
				{@const color = getCategoryColor(category)}
				{@const items = itemsByCategory()[category] || []}
				{@const isGenbutsu = category === '現物資産'}
				{@const categoryTotal = isGenbutsu ? getEditedCategoryTotal(category) + editedTotalGold : getEditedCategoryTotal(category)}
				{#if items.length > 0 || (isGenbutsu && data.goldAssets.length > 0)}
					<section class="bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200/50 shadow-lg">
						<div class="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
							<div class="w-7 h-7 {color.accent} rounded-lg flex items-center justify-center">
								<Icon name="wallet" size={14} class="text-white" />
							</div>
							<h2 class="text-base font-bold text-slate-800">{category}</h2>
							<span class="ml-auto text-base font-bold {color.text}">{formatCurrency(categoryTotal)}</span>
						</div>

						<div class="space-y-0.5">
							{#each items as item}
								<div class="flex items-center gap-1 {color.bg} rounded px-2 py-1 border {color.border}">
									<span class="text-sm font-medium text-slate-800 min-w-0 truncate flex-1">{item.name}</span>
									<span class="text-slate-400 text-xs">¥</span>
									<input
										type="number"
										value={getItemAmount(item)}
										oninput={(e) => updateItemAmount(item.id, parseInt((e.target as HTMLInputElement).value) || 0)}
										class="w-20 px-1 py-0.5 bg-white border border-slate-200 rounded text-right text-xs font-bold focus:ring-1 focus:ring-indigo-300"
									/>
									<form method="POST" action="?/deleteItem" use:enhance>
										<input type="hidden" name="item_id" value={item.id} />
										<button type="submit" class="p-0.5 bg-red-100 text-red-600 rounded hover:bg-red-200">
											<Icon name="minus" size={12} />
										</button>
									</form>
								</div>
							{/each}
							<!-- 現物資産の場合、ゴールドを表示 -->
							{#if isGenbutsu}
								{#each data.goldAssets as gold}
									{@const values = getGoldValue(gold)}
									{@const jpyValue = calcGoldJpy(values.quantity, values.jpy_price)}
									<div class="flex items-center gap-1 {color.bg} rounded px-2 py-1 border {color.border}">
										<span class="text-sm font-medium text-slate-800 min-w-0 truncate flex-1">{gold.name}</span>
										<input
											type="number"
											step="0.01"
											value={values.quantity}
											oninput={(e) => updateGoldValue(gold.id, 'quantity', parseFloat((e.target as HTMLInputElement).value) || 0)}
											class="w-14 px-1 py-0.5 bg-white border border-slate-200 rounded text-right text-xs focus:ring-1 focus:ring-amber-300"
											title="数量(g)"
										/>
										<span class="text-slate-400 text-xs">g×¥</span>
										<input
											type="number"
											step="1"
											value={values.jpy_price}
											oninput={(e) => updateGoldValue(gold.id, 'jpy_price', parseFloat((e.target as HTMLInputElement).value) || 0)}
											class="w-16 px-1 py-0.5 bg-white border border-slate-200 rounded text-right text-xs focus:ring-1 focus:ring-amber-300"
											title="1g単価"
										/>
										<span class="text-xs font-bold text-amber-600 w-16 text-right">{formatCurrency(jpyValue)}</span>
										<form method="POST" action="?/deleteGold" use:enhance>
											<input type="hidden" name="gold_id" value={gold.id} />
											<button type="submit" class="p-0.5 bg-red-100 text-red-600 rounded hover:bg-red-200">
												<Icon name="minus" size={12} />
											</button>
										</form>
									</div>
								{/each}
								<!-- ゴールド追加フォーム（現物資産内） -->
								<div class="mt-2 pt-2 border-t border-amber-200">
									<form method="POST" action="?/addGold" use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') {
												newGold = { name: '', quantity: '', jpy_price: '', memo: '' };
											}
										};
									}} class="flex flex-wrap items-center gap-1">
										<input type="hidden" name="record_id" value={data.currentRecord.id} />
										<select
											bind:value={newGold.name}
											onchange={(e) => {
												const target = e.target as HTMLSelectElement;
												if (target.value === '__new__') {
													newGold.name = '';
												} else {
													const existing = (data.existingGolds || []).find(g => g.name === target.value);
													if (existing?.memo) {
														newGold.memo = existing.memo;
													}
												}
											}}
											class="px-1 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-amber-300"
										>
											<option value="">選択</option>
											{#each data.existingGolds || [] as gold}
												<option value={gold.name}>{gold.name}</option>
											{/each}
											<option value="__new__">＋新規</option>
										</select>
										<input type="hidden" name="name" value={newGold.name} />
										{#if newGold.name === '' || newGold.name === '__new__'}
											<input
												type="text"
												bind:value={newGold.name}
												placeholder="名前"
												class="w-16 px-1 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-amber-300"
											/>
										{/if}
										<input
											type="number"
											name="quantity"
											step="0.01"
											bind:value={newGold.quantity}
											placeholder="g"
											class="w-14 px-1 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-amber-300"
										/>
										<span class="text-slate-400 text-xs">g×¥</span>
										<input
											type="number"
											name="jpy_price"
											step="1"
											bind:value={newGold.jpy_price}
											placeholder="単価"
											class="w-16 px-1 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-amber-300"
										/>
										<button type="submit" class="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded text-xs font-medium hover:from-amber-600 hover:to-yellow-600">
											追加
										</button>
									</form>
								</div>
							{/if}
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
				<span class="ml-auto text-base font-bold text-orange-600">{formatCurrency(editedTotalCrypto)}</span>
			</div>

			{#if data.cryptoAssets.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
					{#each data.cryptoAssets as crypto}
						{@const values = getCryptoValue(crypto)}
						{@const jpyValue = calcCryptoJpy(values.quantity, values.usd_price, values.jpy_rate)}
						<div class="bg-orange-50 rounded-lg p-2 border border-orange-200 relative">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-bold text-slate-800">{crypto.name}</span>
								<span class="text-sm font-bold text-orange-600">{formatCurrency(jpyValue)}</span>
							</div>
							<div class="flex items-center gap-1">
								<input
									type="number"
									step="0.00000001"
									value={values.quantity}
									oninput={(e) => updateCryptoValue(crypto.id, 'quantity', parseFloat((e.target as HTMLInputElement).value) || 0)}
									class="w-16 px-1 py-0.5 bg-white border border-slate-200 rounded text-right text-xs focus:ring-1 focus:ring-orange-300"
									title="数量"
								/>
								<span class="text-slate-400 text-xs">×$</span>
								<input
									type="number"
									step="0.01"
									value={values.usd_price}
									oninput={(e) => updateCryptoValue(crypto.id, 'usd_price', parseFloat((e.target as HTMLInputElement).value) || 0)}
									class="w-14 px-1 py-0.5 bg-white border border-slate-200 rounded text-right text-xs focus:ring-1 focus:ring-orange-300"
									title="USD価格"
								/>
								<span class="text-slate-400 text-xs">×¥</span>
								<input
									type="number"
									step="0.01"
									value={values.jpy_rate}
									oninput={(e) => updateCryptoValue(crypto.id, 'jpy_rate', parseFloat((e.target as HTMLInputElement).value) || 0)}
									class="w-12 px-1 py-0.5 bg-white border border-slate-200 rounded text-right text-xs focus:ring-1 focus:ring-orange-300"
									title="為替"
								/>
							</div>
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
