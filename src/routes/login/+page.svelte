<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>ログイン - 家計簿アプリ</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
	<div class="w-full max-w-md">
		<!-- ロゴ -->
		<div class="text-center mb-8">
			<a href="/" class="inline-flex items-center gap-2">
				<div class="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
					<Icon name="wallet" size={24} />
				</div>
				<span class="text-2xl font-bold text-slate-800">家計簿</span>
			</a>
		</div>

		<!-- フォーム -->
		<div class="bg-white rounded-xl border border-slate-200 p-8">
			<h1 class="text-2xl font-bold text-slate-800 text-center mb-6">
				ログイン
			</h1>

			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
					<Icon name="warning" size={20} />
					<span>{form.error}</span>
				</div>
			{/if}

			<form
				method="POST"
				action="?/login"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-5"
			>
				<div>
					<label for="email" class="block text-sm font-medium text-slate-700 mb-2">
						メールアドレス
					</label>
					<input
						type="email"
						id="email"
						name="email"
						class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
						placeholder="メールアドレスを入力"
						required
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-slate-700 mb-2">
						パスワード
					</label>
					<input
						type="password"
						id="password"
						name="password"
						class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
						placeholder="パスワードを入力"
						required
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						処理中...
					{:else}
						ログイン
					{/if}
				</button>
			</form>
		</div>

		<!-- 戻るリンク -->
		<div class="text-center mt-6">
			<a href="/" class="text-slate-500 hover:text-slate-700">
				← トップページに戻る
			</a>
		</div>
	</div>
</div>
