<script lang="ts">
	import { page } from '$app/stores';
	import Icon from './Icon.svelte';

	let { email = 'user@example.com' }: { email?: string } = $props();

	const menuItems = [
		{ href: '/monthly-income', icon: 'plus', label: '月次収支追加' },
		{ href: '/monthly-comparison', icon: 'chart-up', label: '月次収支比較' },
		{ href: '/monthly-assets', icon: 'bank', label: '月次資産追加' },
		{ href: '/reports', icon: 'report', label: 'レポート' }
	];

	// メールアドレスの@より前を表示名として使用
	const displayName = $derived(email.split('@')[0]);
</script>

<aside class="w-64 bg-slate-800 min-h-screen flex flex-col">
	<!-- ロゴ -->
	<div class="p-6 border-b border-slate-700">
		<a href="/monthly-income" class="flex items-center gap-3">
			<div class="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
				<Icon name="wallet" size={24} />
			</div>
			<span class="text-xl font-bold text-white">家計簿</span>
		</a>
	</div>

	<!-- ナビゲーション -->
	<nav class="flex-1 p-4">
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

	<!-- ユーザー情報 -->
	<div class="p-4 border-t border-slate-700">
		<div class="flex items-center gap-3 px-4 py-3">
			<div class="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-slate-300">
				<span class="text-sm font-medium">{displayName.charAt(0).toUpperCase()}</span>
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-medium text-white truncate">{displayName}</p>
				<p class="text-xs text-slate-400">ログイン中</p>
			</div>
		</div>
		<form method="POST" action="/logout">
			<button
				type="submit"
				class="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
			>
				<Icon name="logout" size={20} />
				<span>ログアウト</span>
			</button>
		</form>
	</div>
</aside>
