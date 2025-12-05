<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	let type = $state<'income' | 'expense'>('expense');
	let amount = $state('');
	let category = $state('');
	let description = $state('');
	let date = $state(new Date().toISOString().split('T')[0]);

	const incomeCategories = ['給与', '副収入', '投資収益', 'その他収入'];
	const expenseCategories = ['食費', '光熱費', '通信費', '交通費', '住居費', '医療費', '娯楽費', '衣服費', '教育費', 'その他支出'];

	const categories = $derived(type === 'income' ? incomeCategories : expenseCategories);
</script>

<svelte:head>
	<title>収支を追加 - 家計簿アプリ</title>
</svelte:head>

<div class="p-6 max-w-2xl">
	<!-- ページタイトル -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-slate-800">収支を追加</h1>
		<p class="text-slate-500">新しい収入または支出を記録します</p>
	</div>

	<!-- フォーム -->
	<div class="bg-white rounded-xl p-6 border border-slate-200">
		<form class="space-y-6">
			<!-- 種類選択 -->
			<div>
				<label class="block text-sm font-medium text-slate-700 mb-3">種類</label>
				<div class="flex gap-4">
					<button
						type="button"
						onclick={() => { type = 'income'; category = ''; }}
						class="flex-1 py-3 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 {type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}"
					>
						<Icon name="chart-up" size={20} />
						<span class="font-medium">収入</span>
					</button>
					<button
						type="button"
						onclick={() => { type = 'expense'; category = ''; }}
						class="flex-1 py-3 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 {type === 'expense' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}"
					>
						<Icon name="chart-down" size={20} />
						<span class="font-medium">支出</span>
					</button>
				</div>
			</div>

			<!-- 金額 -->
			<div>
				<label for="amount" class="block text-sm font-medium text-slate-700 mb-2">
					金額
				</label>
				<div class="relative">
					<span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
					<input
						type="number"
						id="amount"
						bind:value={amount}
						placeholder="0"
						class="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg"
					/>
				</div>
			</div>

			<!-- カテゴリ -->
			<div>
				<label for="category" class="block text-sm font-medium text-slate-700 mb-2">
					カテゴリ
				</label>
				<select
					id="category"
					bind:value={category}
					class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
				>
					<option value="">カテゴリを選択</option>
					{#each categories as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</div>

			<!-- 日付 -->
			<div>
				<label for="date" class="block text-sm font-medium text-slate-700 mb-2">
					日付
				</label>
				<input
					type="date"
					id="date"
					bind:value={date}
					class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
				/>
			</div>

			<!-- 説明 -->
			<div>
				<label for="description" class="block text-sm font-medium text-slate-700 mb-2">
					説明（任意）
				</label>
				<input
					type="text"
					id="description"
					bind:value={description}
					placeholder="例：スーパーで食材購入"
					class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
				/>
			</div>

			<!-- 送信ボタン -->
			<div class="flex gap-4">
				<a
					href="/transactions"
					class="flex-1 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-center font-medium"
				>
					キャンセル
				</a>
				<button
					type="submit"
					class="flex-1 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
				>
					追加する
				</button>
			</div>
		</form>
	</div>
</div>
