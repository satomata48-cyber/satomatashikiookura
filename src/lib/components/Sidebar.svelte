<script lang="ts">
	import { page } from '$app/stores';
	import Icon from './Icon.svelte';

	let { email = 'user@example.com' }: { email?: string } = $props();

	const menuItems = [
		{ href: '/user/monthly-income', icon: 'plus', label: '月次収支追加', shortLabel: '収支' },
		{ href: '/user/monthly-comparison', icon: 'chart-up', label: '月次収支比較', shortLabel: '比較' },
		{ href: '/user/monthly-assets', icon: 'bank', label: '月次資産追加', shortLabel: '資産' },
		{ href: '/user/assets-comparison', icon: 'investment', label: '月次資産比較', shortLabel: '推移' },
		{ href: '/user/reports', icon: 'report', label: 'レポート', shortLabel: 'レポート' },
		{ href: '/user/documents', icon: 'document', label: 'ドキュメント', shortLabel: 'メモ' }
	];

	// メールアドレスの@より前を表示名として使用
	const displayName = $derived(email.split('@')[0]);

	// モバイルメニューの開閉状態
	let mobileMenuOpen = $state(false);
</script>

<!-- デスクトップ用サイドバー（固定位置） -->
<aside class="hidden lg:flex w-64 bg-slate-800 fixed top-0 left-0 h-screen flex-col">
	<!-- ロゴ -->
	<div class="p-6 border-b border-slate-700">
		<a href="/user/monthly-income" class="flex items-center gap-3">
			<div class="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
				<Icon name="wallet" size={24} />
			</div>
			<span class="text-xl font-bold text-white">家計簿</span>
		</a>
	</div>

	<!-- ナビゲーション -->
	<nav class="flex-1 p-4 overflow-y-auto">
		<ul class="space-y-1">
			{#each menuItems as item}
				{@const isActive = $page.url.pathname === item.href}
				<li>
					<a
						href={item.href}
						class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors {isActive
							? 'bg-emerald-500 text-white'
							: 'text-slate-300 hover:bg-slate-700 hover:text-white'}"
					>
						<Icon name={item.icon} size={20} />
						<span>{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- ユーザー情報（固定下部） -->
	<div class="p-4 border-t border-slate-700 bg-slate-800">
		<div class="flex items-center gap-3 px-4 py-2">
			<div class="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-slate-300">
				<span class="text-xs font-medium">{displayName.charAt(0).toUpperCase()}</span>
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-medium text-white truncate">{displayName}</p>
			</div>
		</div>
		<form method="POST" action="/logout">
			<button
				type="submit"
				class="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
			>
				<Icon name="logout" size={18} />
				<span class="text-sm">ログアウト</span>
			</button>
		</form>
	</div>
</aside>

<!-- デスクトップ用サイドバーのスペーサー -->
<div class="hidden lg:block w-64 shrink-0"></div>

<!-- モバイル用ボトムナビゲーション -->
<nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
	<div class="flex justify-around items-center h-16">
		{#each menuItems as item}
			{@const isActive = $page.url.pathname === item.href}
			<a
				href={item.href}
				class="flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors {isActive
					? 'text-emerald-600'
					: 'text-slate-500'}"
			>
				<Icon name={item.icon} size={22} />
				<span class="text-xs mt-0.5 font-medium">{item.shortLabel}</span>
			</a>
		{/each}
		<!-- メニューボタン（ログアウト等） -->
		<button
			type="button"
			onclick={() => mobileMenuOpen = !mobileMenuOpen}
			class="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500"
		>
			<Icon name="list" size={22} />
			<span class="text-xs mt-0.5 font-medium">メニュー</span>
		</button>
	</div>
</nav>

<!-- モバイルメニューオーバーレイ -->
{#if mobileMenuOpen}
	<div class="lg:hidden fixed inset-0 z-50">
		<!-- 背景オーバーレイ -->
		<button
			type="button"
			class="absolute inset-0 bg-black/50"
			onclick={() => mobileMenuOpen = false}
			aria-label="メニューを閉じる"
		></button>

		<!-- メニューパネル -->
		<div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 pb-8 safe-area-bottom">
			<div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4"></div>

			<!-- ユーザー情報 -->
			<div class="flex items-center gap-3 p-3 bg-slate-100 rounded-lg mb-4">
				<div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
					<span class="text-sm font-bold">{displayName.charAt(0).toUpperCase()}</span>
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-slate-800 truncate">{displayName}</p>
					<p class="text-xs text-slate-500">ログイン中</p>
				</div>
			</div>

			<!-- ログアウトボタン -->
			<form method="POST" action="/logout">
				<button
					type="submit"
					class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-lg font-medium"
				>
					<Icon name="logout" size={20} />
					<span>ログアウト</span>
				</button>
			</form>
		</div>
	</div>
{/if}

<style>
	/* iPhoneのセーフエリア対応 */
	.safe-area-bottom {
		padding-bottom: env(safe-area-inset-bottom, 0);
	}
</style>
