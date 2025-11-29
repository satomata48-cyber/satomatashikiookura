<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
	<title>家計簿アプリ - シンプルで使いやすい家計管理</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<!-- ヘッダー -->
	<header class="px-6 py-4 bg-white border-b border-slate-200">
		<nav class="max-w-6xl mx-auto flex justify-between items-center">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
					<Icon name="wallet" size={20} />
				</div>
				<span class="text-xl font-bold text-slate-800">家計簿</span>
			</div>
			<a
				href="/login"
				class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
			>
				ログイン
			</a>
		</nav>
	</header>

	<!-- ヒーローセクション -->
	<main class="max-w-6xl mx-auto px-6 py-20">
		<div class="text-center mb-20">
			<h1 class="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
				シンプルで使いやすい<br />
				<span class="text-emerald-500">家計管理システム</span>
			</h1>
			<p class="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
				毎月の収支を簡単に記録・分析。資産の推移もひと目で確認できます。
				無駄な出費を見つけて、賢くお金を管理しましょう。
			</p>
			<div class="flex gap-4 justify-center">
				<a
					href="/login"
					class="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-lg"
				>
					今すぐ始める
				</a>
			</div>
		</div>

		<!-- 特徴セクション -->
		<div class="grid md:grid-cols-3 gap-6 mb-20">
			<div class="bg-white rounded-xl p-8 border border-slate-200">
				<div class="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 mb-4">
					<Icon name="report" size={24} />
				</div>
				<h3 class="text-xl font-bold text-slate-800 mb-3">月次レポート</h3>
				<p class="text-slate-600">
					収入と支出のバランスをグラフで可視化。月ごとの推移を簡単に確認できます。
				</p>
			</div>
			<div class="bg-white rounded-xl p-8 border border-slate-200">
				<div class="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 mb-4">
					<Icon name="investment" size={24} />
				</div>
				<h3 class="text-xl font-bold text-slate-800 mb-3">資産管理</h3>
				<p class="text-slate-600">
					預金から投資まで、すべての資産を一元管理。増加率もチェックできます。
				</p>
			</div>
			<div class="bg-white rounded-xl p-8 border border-slate-200">
				<div class="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 mb-4">
					<Icon name="list" size={24} />
				</div>
				<h3 class="text-xl font-bold text-slate-800 mb-3">カテゴリ分類</h3>
				<p class="text-slate-600">
					食費、光熱費、娯楽費など、支出をカテゴリ別に分類。無駄遣いを発見できます。
				</p>
			</div>
		</div>

		<!-- 機能プレビュー -->
		<div class="bg-white rounded-xl p-8 border border-slate-200">
			<h2 class="text-2xl font-bold text-slate-800 mb-8 text-center">主な機能</h2>
			<div class="grid md:grid-cols-2 gap-6">
				<div class="flex items-start gap-4">
					<div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
						<Icon name="check" size={20} />
					</div>
					<div>
						<h4 class="font-bold text-slate-800">収支の記録</h4>
						<p class="text-slate-600 text-sm">日々の収入・支出をカテゴリ別に記録</p>
					</div>
				</div>
				<div class="flex items-start gap-4">
					<div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
						<Icon name="check" size={20} />
					</div>
					<div>
						<h4 class="font-bold text-slate-800">月次サマリー</h4>
						<p class="text-slate-600 text-sm">月ごとの収支バランスを自動計算</p>
					</div>
				</div>
				<div class="flex items-start gap-4">
					<div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
						<Icon name="check" size={20} />
					</div>
					<div>
						<h4 class="font-bold text-slate-800">資産推移グラフ</h4>
						<p class="text-slate-600 text-sm">資産の増減をグラフで可視化</p>
					</div>
				</div>
				<div class="flex items-start gap-4">
					<div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
						<Icon name="check" size={20} />
					</div>
					<div>
						<h4 class="font-bold text-slate-800">増加率分析</h4>
						<p class="text-slate-600 text-sm">前月比・前年比の増加率を確認</p>
					</div>
				</div>
			</div>
		</div>
	</main>

	<!-- フッター -->
	<footer class="bg-slate-800 text-slate-400 py-8 mt-20">
		<div class="max-w-6xl mx-auto px-6 text-center">
			<p>&copy; 2024 家計簿アプリ. All rights reserved.</p>
		</div>
	</footer>
</div>
