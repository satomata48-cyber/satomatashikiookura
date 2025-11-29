<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';

	let { data } = $props();

	let showAddCard = $state(false);
	let showAddBank = $state(false);
	let showAddMonth = $state(false);
	let newCardName = $state('');
	let newBankName = $state('');
	let newCardBankId = $state<number | null>(null);
	let newMonth = $state('');

	// カード色定義（各カードにユニークな色を割り当て）
	const cardColors = [
		{ bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', accent: 'bg-rose-100' },
		{ bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', accent: 'bg-amber-100' },
		{ bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-600', accent: 'bg-lime-100' },
		{ bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', accent: 'bg-cyan-100' },
		{ bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', accent: 'bg-violet-100' },
		{ bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', accent: 'bg-pink-100' },
		{ bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', accent: 'bg-teal-100' },
		{ bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', accent: 'bg-orange-100' },
	];

	// 銀行色定義
	const bankColors = [
		{ bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', accent: 'bg-blue-500', light: 'bg-blue-100' },
		{ bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', accent: 'bg-emerald-500', light: 'bg-emerald-100' },
		{ bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', accent: 'bg-purple-500', light: 'bg-purple-100' },
		{ bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', accent: 'bg-indigo-500', light: 'bg-indigo-100' },
		{ bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-600', accent: 'bg-fuchsia-500', light: 'bg-fuchsia-100' },
	];

	function getCardColor(index: number) {
		return cardColors[index % cardColors.length];
	}

	function getBankColor(index: number) {
		return bankColors[index % bankColors.length];
	}

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

	// 銀行ごとにカードをグループ化
	const cardsByBank = $derived(() => {
		const groups: Record<number | 'unassigned', typeof data.cards> = { unassigned: [] };
		data.banks.forEach(bank => {
			groups[bank.id] = [];
		});
		data.cards.forEach(card => {
			if (card.bank_id && groups[card.bank_id]) {
				groups[card.bank_id].push(card);
			} else {
				groups.unassigned.push(card);
			}
		});
		return groups;
	});

	// 銀行ごとのカード合計を計算
	function getBankCardTotal(bankId: number): number {
		if (!data.monthlyData) return 0;
		const bankCards = data.cards.filter(c => c.bank_id === bankId);
		return bankCards.reduce((sum, card) => {
			const payment = data.monthlyData!.cardPayments.find(p => p.card_id === card.id);
			return sum + (payment?.amount || 0);
		}, 0);
	}

	// 銀行ごとの実質負担額を計算（カード合計 - 残高、マイナスは0）
	function getBankNetBurden(bankId: number): number {
		if (!data.monthlyData) return 0;
		const balance = data.monthlyData.bankBalances.find(b => b.bank_id === bankId)?.balance || 0;
		const cardTotal = getBankCardTotal(bankId);
		const burden = cardTotal - balance;
		return burden > 0 ? burden : 0;
	}

	// 合計計算
	const totalCardPayments = $derived(
		data.monthlyData?.cardPayments?.reduce((sum, p) => sum + p.amount, 0) || 0
	);

	const totalBankPayments = $derived(
		data.monthlyData?.bankPayments?.reduce((sum, p) => sum + p.amount, 0) || 0
	);

	const totalBankBalances = $derived(
		data.monthlyData?.bankBalances?.reduce((sum, p) => sum + p.balance, 0) || 0
	);

	// 実質負担合計（カード合計 - 残高、マイナスは0）
	const totalNetBurden = $derived(
		Math.max(totalCardPayments - totalBankBalances, 0)
	);

	// 収支バランス（手取り - 実質負担）
	const balanceAmount = $derived(
		(data.monthlyData?.expectedIncome || 0) - totalNetBurden
	);

	function handleMonthChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		goto(`/monthly-income?month=${target.value}`);
	}
</script>

<svelte:head>
	<title>月次収支 - 家計簿アプリ</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
	<!-- ヘッダー -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
		<div>
			<h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
				月次収支管理
			</h1>
			<p class="text-slate-500 mt-1">カード支払いと銀行引落しを一元管理</p>
		</div>
		<div class="flex items-center gap-3">
			<select
				class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
				value={data.selectedMonth}
				onchange={handleMonthChange}
			>
				{#each data.availableMonths as month}
					<option value={month}>{formatMonth(month)}</option>
				{/each}
			</select>
			<button
				onclick={() => showAddMonth = true}
				class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-200 transition-all"
			>
				<Icon name="plus" size={18} />
				新規月追加
			</button>
		</div>
	</div>

	{#if !data.monthlyData}
		<div class="bg-white/80 backdrop-blur rounded-2xl p-12 border border-slate-200/50 text-center shadow-xl">
			<div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
				<Icon name="wallet" size={40} class="text-indigo-400" />
			</div>
			<p class="text-xl text-slate-600 font-medium">この月のデータがありません</p>
			<p class="text-slate-400 mt-2">「新規月追加」で月を作成してください</p>
		</div>
	{:else}
		<!-- 重要サマリー（一番上に配置） -->
		<div class="bg-gradient-to-r from-slate-100 via-white to-slate-100 rounded-2xl p-6 mb-6 shadow-lg border border-slate-200">
			<div class="grid grid-cols-3 gap-6 text-center">
				<div>
					<p class="text-slate-500 text-sm mb-1">支払合計</p>
					<p class="text-3xl font-bold text-rose-600">{formatCurrency(totalCardPayments)}</p>
				</div>
				<div>
					<p class="text-slate-500 text-sm mb-1">残高合計</p>
					<p class="text-3xl font-bold text-blue-600">{formatCurrency(totalBankBalances)}</p>
				</div>
				<div>
					<p class="text-slate-500 text-sm mb-1">実質負担合計</p>
					<p class="text-3xl font-bold text-amber-600">{formatCurrency(totalNetBurden)}</p>
				</div>
			</div>
		</div>

		<!-- サマリーカード -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
			<!-- 手取り予想 -->
			<div class="bg-white/80 backdrop-blur rounded-2xl p-5 border border-emerald-100 shadow-lg shadow-emerald-100/50">
				<div class="flex items-center gap-3 mb-2">
					<div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
						<Icon name="chart-up" size={20} class="text-white" />
					</div>
					<span class="text-sm text-slate-500">手取り予想</span>
				</div>
				<p class="text-2xl font-bold text-emerald-600">{formatCurrency(data.monthlyData.expectedIncome)}</p>
			</div>

			<!-- カード支払合計 -->
			<div class="bg-white/80 backdrop-blur rounded-2xl p-5 border border-rose-100 shadow-lg shadow-rose-100/50">
				<div class="flex items-center gap-3 mb-2">
					<div class="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
						<Icon name="wallet" size={20} class="text-white" />
					</div>
					<span class="text-sm text-slate-500">カード合計</span>
				</div>
				<p class="text-2xl font-bold text-rose-600">{formatCurrency(totalCardPayments)}</p>
			</div>

			<!-- 銀行支払合計 -->
			<div class="bg-white/80 backdrop-blur rounded-2xl p-5 border border-amber-100 shadow-lg shadow-amber-100/50">
				<div class="flex items-center gap-3 mb-2">
					<div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
						<Icon name="bank" size={20} class="text-white" />
					</div>
					<span class="text-sm text-slate-500">銀行支払合計</span>
				</div>
				<p class="text-2xl font-bold text-amber-600">{formatCurrency(totalBankPayments)}</p>
			</div>

			<!-- 銀行残高合計 -->
			<div class="bg-white/80 backdrop-blur rounded-2xl p-5 border border-blue-100 shadow-lg shadow-blue-100/50">
				<div class="flex items-center gap-3 mb-2">
					<div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
						<Icon name="sparkle" size={20} class="text-white" />
					</div>
					<span class="text-sm text-slate-500">残高合計</span>
				</div>
				<p class="text-2xl font-bold text-blue-600">{formatCurrency(totalBankBalances)}</p>
			</div>

			<!-- 実質負担 -->
			<div class="bg-white/80 backdrop-blur rounded-2xl p-5 border border-purple-100 shadow-lg shadow-purple-100/50">
				<div class="flex items-center gap-3 mb-2">
					<div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
						<Icon name="chart-down" size={20} class="text-white" />
					</div>
					<span class="text-sm text-slate-500">実質負担</span>
				</div>
				<p class="text-2xl font-bold text-purple-600">{formatCurrency(totalNetBurden)}</p>
			</div>
		</div>

		<!-- 収支バランス表示 -->
		<div class="bg-white/80 backdrop-blur rounded-2xl p-6 border shadow-xl mb-8 {balanceAmount >= 0 ? 'border-emerald-200' : 'border-red-200'}">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg {balanceAmount >= 0 ? 'bg-gradient-to-br from-emerald-400 to-teal-400 shadow-emerald-200' : 'bg-gradient-to-br from-red-400 to-rose-400 shadow-red-200'}">
						<Icon name={balanceAmount >= 0 ? 'chart-up' : 'warning'} size={28} class="text-white" />
					</div>
					<div>
						<p class="text-sm text-slate-500">今月の収支バランス</p>
						<p class="text-3xl font-bold {balanceAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}">
							{balanceAmount >= 0 ? '+' : ''}{formatCurrency(balanceAmount)}
						</p>
					</div>
				</div>
				<form method="POST" action="?/updateExpectedIncome" use:enhance class="flex items-center gap-3">
					<input type="hidden" name="record_id" value={data.monthlyData.id} />
					<label class="text-sm font-medium text-slate-600">手取り予想:</label>
					<div class="flex items-center gap-2">
						<span class="text-slate-400">¥</span>
						<input
							type="number"
							name="amount"
							value={data.monthlyData.expectedIncome}
							class="w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
						/>
						<button type="submit" class="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium">
							更新
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- メインコンテンツ -->
		<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
			<!-- 銀行ごとのカード支払い -->
			<section class="bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-200/50 shadow-xl">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
						<span class="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-lg flex items-center justify-center">
							<Icon name="wallet" size={16} class="text-white" />
						</span>
						カード別支払金額
					</h2>
					<button
						onclick={() => showAddCard = true}
						class="text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1"
					>
						<Icon name="plus" size={16} />
						カード追加
					</button>
				</div>

				<!-- 銀行ごとにグループ化表示 -->
				{#each data.banks as bank, bankIndex}
					{@const bankColor = getBankColor(bankIndex)}
					{@const bankCards = cardsByBank()[bank.id] || []}
					{@const bankTotal = getBankCardTotal(bank.id)}
					{#if bankCards.length > 0}
						<div class="mb-6 last:mb-0">
							<div class="{bankColor.bg} rounded-xl p-4 border {bankColor.border}">
								<div class="flex items-center gap-2 mb-3">
									<div class="w-6 h-6 {bankColor.accent} rounded-md flex items-center justify-center">
										<Icon name="bank" size={12} class="text-white" />
									</div>
									<span class="font-semibold {bankColor.text}">{bank.name}</span>
									<span class="ml-auto text-sm font-bold {bankColor.text}">計: {formatCurrency(bankTotal)}</span>
								</div>
								<div class="space-y-2">
									{#each bankCards as card, cardIndex}
										{@const payment = data.monthlyData.cardPayments.find(p => p.card_id === card.id)}
										{@const cardColor = getCardColor(cardIndex)}
										<div class="flex flex-wrap items-center gap-2 {cardColor.bg} rounded-lg p-3 border {cardColor.border}">
											<span class="font-medium {cardColor.text} min-w-0 truncate">{card.name}</span>
											<form method="POST" action="?/updateCardPaymentDay" use:enhance class="shrink-0">
												<input type="hidden" name="card_id" value={card.id} />
												<select name="payment_day" onchange={(e) => e.currentTarget.form?.requestSubmit()}
													class="text-xs px-1.5 py-1 bg-white border border-slate-200 rounded-lg cursor-pointer">
													{#each Array.from({length: 31}, (_, i) => i + 1) as day}
														<option value={day} selected={day === (card.payment_day || 27)}>{day}日</option>
													{/each}
												</select>
											</form>
											<form method="POST" action="?/updateCardBank" use:enhance class="ml-auto shrink-0">
												<input type="hidden" name="card_id" value={card.id} />
												<select name="bank_id" onchange={(e) => e.currentTarget.form?.requestSubmit()}
													class="text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg cursor-pointer">
													{#each data.banks as b}
														<option value={b.id} selected={b.id === card.bank_id}>{b.name}</option>
													{/each}
													<option value="">なし</option>
												</select>
											</form>
											<form method="POST" action="?/upsertCardPayment" use:enhance class="flex items-center gap-2 shrink-0">
												<input type="hidden" name="record_id" value={data.monthlyData.id} />
												<input type="hidden" name="card_id" value={card.id} />
												<span class="text-slate-400">¥</span>
												<input
													type="number"
													name="amount"
													value={payment?.amount || 0}
													class="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-right focus:ring-2 focus:ring-indigo-300"
												/>
												<button type="submit" class="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors">
													<Icon name="check" size={16} />
												</button>
											</form>
										</div>
									{/each}
								</div>
							</div>
						</div>
					{/if}
				{/each}

				<!-- 未割当カード -->
				{#if (cardsByBank().unassigned || []).length > 0}
				{@const unassignedCards = cardsByBank().unassigned || []}
					<div class="mb-6">
						<div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
							<div class="flex items-center gap-2 mb-3">
								<div class="w-6 h-6 bg-slate-400 rounded-md flex items-center justify-center">
									<Icon name="warning" size={12} class="text-white" />
								</div>
								<span class="font-semibold text-slate-600">銀行未設定</span>
							</div>
							<div class="space-y-2">
								{#each unassignedCards as card, cardIndex}
									{@const payment = data.monthlyData.cardPayments.find(p => p.card_id === card.id)}
									{@const cardColor = getCardColor(cardIndex)}
									<div class="flex flex-wrap items-center gap-2 {cardColor.bg} rounded-lg p-3 border {cardColor.border}">
										<span class="font-medium {cardColor.text}">{card.name}</span>
										<form method="POST" action="?/updateCardPaymentDay" use:enhance class="shrink-0">
											<input type="hidden" name="card_id" value={card.id} />
											<select name="payment_day" onchange={(e) => e.currentTarget.form?.requestSubmit()}
												class="text-xs px-1.5 py-1 bg-white border border-slate-200 rounded-lg cursor-pointer">
												{#each Array.from({length: 31}, (_, i) => i + 1) as day}
													<option value={day} selected={day === (card.payment_day || 27)}>{day}日</option>
												{/each}
											</select>
										</form>
										<form method="POST" action="?/updateCardBank" use:enhance class="ml-auto shrink-0">
											<input type="hidden" name="card_id" value={card.id} />
											<select name="bank_id" onchange={(e) => e.currentTarget.form?.requestSubmit()}
												class="text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg cursor-pointer">
												<option value="">銀行を選択</option>
												{#each data.banks as bank}
													<option value={bank.id}>{bank.name}</option>
												{/each}
											</select>
										</form>
										<form method="POST" action="?/upsertCardPayment" use:enhance class="flex items-center gap-2 shrink-0">
											<input type="hidden" name="record_id" value={data.monthlyData.id} />
											<input type="hidden" name="card_id" value={card.id} />
											<span class="text-slate-400">¥</span>
											<input
												type="number"
												name="amount"
												value={payment?.amount || 0}
												class="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-right focus:ring-2 focus:ring-indigo-300"
											/>
											<button type="submit" class="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors">
												<Icon name="check" size={16} />
											</button>
										</form>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}

				<!-- カード合計 -->
				<div class="pt-4 border-t-2 border-dashed border-slate-200 flex justify-between items-center">
					<span class="font-bold text-slate-700 text-lg">カード支払合計</span>
					<span class="text-2xl font-bold text-rose-600">{formatCurrency(totalCardPayments)}</span>
				</div>
			</section>

			<!-- 銀行支払い・残高・実質負担 -->
			<section class="bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-200/50 shadow-xl">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
						<span class="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
							<Icon name="bank" size={16} class="text-white" />
						</span>
						銀行別集計
					</h2>
					<button
						onclick={() => showAddBank = true}
						class="text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1"
					>
						<Icon name="plus" size={16} />
						銀行追加
					</button>
				</div>

				<div class="space-y-4">
					{#each data.banks as bank, bankIndex}
						{@const bankColor = getBankColor(bankIndex)}
						{@const payment = data.monthlyData.bankPayments.find(p => p.bank_id === bank.id)}
						{@const balance = data.monthlyData.bankBalances.find(b => b.bank_id === bank.id)}
						{@const cardTotal = getBankCardTotal(bank.id)}
						{@const netBurden = getBankNetBurden(bank.id)}
						{@const bankCards = cardsByBank()[bank.id] || []}
						<div class="{bankColor.bg} rounded-xl p-4 border {bankColor.border}">
							<div class="flex items-center gap-2 mb-4">
								<div class="w-8 h-8 {bankColor.accent} rounded-lg flex items-center justify-center shadow-md">
									<Icon name="bank" size={16} class="text-white" />
								</div>
								<span class="font-bold {bankColor.text} text-lg">{bank.name}</span>
							</div>

							<!-- 紐づいたカード一覧 -->
							{#if bankCards.length > 0}
								<div class="mb-4 p-3 bg-white/50 rounded-lg border border-slate-200/50">
									<p class="text-xs text-slate-500 mb-2 flex items-center gap-1">
										<Icon name="wallet" size={12} />
										紐づいたカード
									</p>
									<div class="flex flex-wrap gap-2">
										{#each bankCards as card, cardIndex}
											{@const cardPayment = data.monthlyData.cardPayments.find(p => p.card_id === card.id)}
											{@const cardColor = getCardColor(cardIndex)}
											<div class="{cardColor.bg} {cardColor.border} border rounded-lg px-3 py-1.5 flex items-center gap-2">
												<span class="text-sm font-medium {cardColor.text}">{card.name}</span>
												<span class="text-xs bg-white/80 px-1.5 py-0.5 rounded text-slate-500">{card.payment_day || 27}日</span>
												<span class="text-xs text-slate-500">{formatCurrency(cardPayment?.amount || 0)}</span>
											</div>
										{/each}
									</div>
								</div>
							{:else}
								<div class="mb-4 p-3 bg-slate-100/50 rounded-lg border border-dashed border-slate-300">
									<p class="text-xs text-slate-400 text-center">紐づいたカードがありません</p>
								</div>
							{/if}

							<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
								<!-- 銀行支払額（カード合計から自動表示） -->
								<div class="{bankColor.light} rounded-lg p-3">
									<p class="text-xs text-slate-500 mb-1">カード合計</p>
									<p class="text-lg font-bold {bankColor.text}">{formatCurrency(cardTotal)}</p>
								</div>

								<!-- 銀行残高 -->
								<form method="POST" action="?/upsertBankBalance" use:enhance class="{bankColor.light} rounded-lg p-3">
									<input type="hidden" name="record_id" value={data.monthlyData.id} />
									<input type="hidden" name="bank_id" value={bank.id} />
									<p class="text-xs text-slate-500 mb-1">残高</p>
									<div class="flex items-center gap-1">
										<span class="text-sm text-slate-400">¥</span>
										<input
											type="number"
											name="balance"
											value={balance?.balance || 0}
											class="w-full px-2 py-1 bg-white/80 border border-slate-200 rounded-lg text-right text-sm font-bold focus:ring-2 focus:ring-indigo-300"
										/>
										<button type="submit" class="p-1 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200">
											<Icon name="check" size={14} />
										</button>
									</div>
								</form>

								<!-- 実質負担額 -->
								<div class="bg-white/60 rounded-lg p-3 border border-slate-200">
									<p class="text-xs text-slate-500 mb-1">実質負担額</p>
									<p class="text-lg font-bold {netBurden > 0 ? 'text-amber-600' : 'text-emerald-600'}">
										{formatCurrency(netBurden)}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- 銀行合計 -->
				<div class="mt-6 pt-4 border-t-2 border-dashed border-slate-200">
					<div class="grid grid-cols-3 gap-4 text-center">
						<div>
							<p class="text-sm text-slate-500 mb-1">支払合計</p>
							<p class="text-xl font-bold text-amber-600">{formatCurrency(totalBankPayments)}</p>
						</div>
						<div>
							<p class="text-sm text-slate-500 mb-1">残高合計</p>
							<p class="text-xl font-bold text-blue-600">{formatCurrency(totalBankBalances)}</p>
						</div>
						<div>
							<p class="text-sm text-slate-500 mb-1">実質負担合計</p>
							<p class="text-xl font-bold text-purple-600">{formatCurrency(totalNetBurden)}</p>
						</div>
					</div>
				</div>
			</section>
		</div>

		<!-- 反省・教訓メモ -->
		<section class="mt-6 bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-200/50 shadow-xl">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-200">
					<Icon name="sparkle" size={20} class="text-white" />
				</div>
				<div>
					<h2 class="text-xl font-bold text-slate-800">今月の反省・教訓</h2>
					<p class="text-sm text-slate-500">気づいたことや次月への改善点を記録</p>
				</div>
			</div>
			<form method="POST" action="?/updateNotes" use:enhance class="space-y-4">
				<input type="hidden" name="record_id" value={data.monthlyData.id} />
				<textarea
					name="notes"
					rows={4}
					placeholder="例: 今月は外食が多かった。来月は自炊を増やして食費を抑えたい..."
					class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 resize-none"
				>{data.monthlyData.notes}</textarea>
				<div class="flex justify-end">
					<button type="submit" class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-200 transition-all font-medium">
						<Icon name="check" size={18} />
						メモを保存
					</button>
				</div>
			</form>
		</section>
	{/if}
</div>

<!-- 新規月追加モーダル -->
{#if showAddMonth}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
		<div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
			<h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
				<span class="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
					<Icon name="plus" size={16} class="text-white" />
				</span>
				新規月追加
			</h3>
			<form method="POST" action="?/createMonth" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						showAddMonth = false;
						goto(`/monthly-income?month=${newMonth}`);
					}
				};
			}}>
				<input
					type="month"
					name="year_month"
					bind:value={newMonth}
					class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-300"
					required
				/>
				<div class="flex gap-3">
					<button type="submit" class="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 font-medium transition-all shadow-lg shadow-emerald-200">
						<Icon name="check" size={18} />
						保存
					</button>
					<button
						type="button"
						onclick={() => showAddMonth = false}
						class="flex-1 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors"
					>
						キャンセル
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- カード追加モーダル -->
{#if showAddCard}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
		<div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
			<h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
				<span class="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-lg flex items-center justify-center">
					<Icon name="wallet" size={16} class="text-white" />
				</span>
				カード追加
			</h3>
			<form method="POST" action="?/addCard" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						showAddCard = false;
						newCardName = '';
						newCardBankId = null;
					}
				};
			}}>
				<input
					type="text"
					name="name"
					bind:value={newCardName}
					placeholder="カード名（例：楽天カード）"
					class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-300"
					required
				/>
				<select
					name="bank_id"
					bind:value={newCardBankId}
					class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-300"
				>
					<option value="">引落し銀行を選択（任意）</option>
					{#each data.banks as bank}
						<option value={bank.id}>{bank.name}</option>
					{/each}
				</select>
				<div class="flex gap-3">
					<button
						type="button"
						onclick={() => showAddCard = false}
						class="flex-1 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors"
					>
						キャンセル
					</button>
					<button type="submit" class="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 font-medium transition-all shadow-lg shadow-rose-200">
						追加
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- 銀行追加モーダル -->
{#if showAddBank}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
		<div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
			<h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
				<span class="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
					<Icon name="bank" size={16} class="text-white" />
				</span>
				銀行追加
			</h3>
			<form method="POST" action="?/addBank" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						showAddBank = false;
						newBankName = '';
					}
				};
			}}>
				<input
					type="text"
					name="name"
					bind:value={newBankName}
					placeholder="銀行名（例：三井住友銀行）"
					class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-300"
					required
				/>
				<div class="flex gap-3">
					<button
						type="button"
						onclick={() => showAddBank = false}
						class="flex-1 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors"
					>
						キャンセル
					</button>
					<button type="submit" class="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 font-medium transition-all shadow-lg shadow-blue-200">
						追加
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
