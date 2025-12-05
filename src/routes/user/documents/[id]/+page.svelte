<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data } = $props();

	let title = $state(data.document.title);
	let content = $state(data.document.content);
	let emoji = $state(data.document.emoji);
	let isSaving = $state(false);
	let lastSaved = $state<Date | null>(null);
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let showEmojiPicker = $state(false);
	let showMenu = $state(false);

	const commonEmojis = [
		'📄', '📝', '📋', '📌', '📎', '📁', '📂', '🗂️',
		'💡', '💰', '💵', '💴', '💳', '🏦', '📊', '📈',
		'🎯', '✅', '⭐', '❤️', '🔥', '💎', '🏠', '🚗',
		'🍽️', '🛒', '💊', '🎮', '📱', '💻', '🔧', '📚',
		'🌟', '🎨', '🎬', '🎵', '✈️', '🌍', '🏃', '🧘'
	];

	async function saveDocument() {
		if (saveTimeout) clearTimeout(saveTimeout);
		isSaving = true;

		try {
			await fetch(`/api/documents/${data.document.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title, content, emoji })
			});
			lastSaved = new Date();
		} finally {
			isSaving = false;
		}
	}

	function scheduleAutoSave() {
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(saveDocument, 1500);
	}

	async function deleteDocument() {
		if (!confirm('このドキュメントを削除しますか？')) return;
		await fetch(`/api/documents/${data.document.id}`, { method: 'DELETE' });
		goto('/documents');
	}

	function selectEmoji(e: string) {
		emoji = e;
		showEmojiPicker = false;
		scheduleAutoSave();
	}

	function formatTime(date: Date): string {
		return new Intl.DateTimeFormat('ja-JP', {
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	onMount(() => {
		return () => {
			if (saveTimeout) clearTimeout(saveTimeout);
		};
	});
</script>

<svelte:head>
	<title>{title || '無題'} - ドキュメント</title>
</svelte:head>

<div class="min-h-screen bg-white">
	<!-- Notion風ヘッダー -->
	<header class="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100">
		<div class="max-w-4xl mx-auto px-4 sm:px-8">
			<div class="flex items-center justify-between h-12">
				<!-- 左側：戻るボタンとパンくず -->
				<div class="flex items-center gap-2 text-sm">
					<a
						href="/documents"
						class="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="15,18 9,12 15,6" />
						</svg>
						<span class="hidden sm:inline">ドキュメント</span>
					</a>
					<span class="text-gray-300">/</span>
					<span class="text-gray-500 truncate max-w-32">{title || '無題'}</span>
				</div>

				<!-- 右側：保存状態とメニュー -->
				<div class="flex items-center gap-2">
					<!-- 保存状態 -->
					<div class="text-xs text-gray-400">
						{#if isSaving}
							<span class="flex items-center gap-1">
								<span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
								保存中
							</span>
						{:else if lastSaved}
							<span class="flex items-center gap-1">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald-500">
									<polyline points="20,6 9,17 4,12" />
								</svg>
								{formatTime(lastSaved)}
							</span>
						{/if}
					</div>

					<!-- メニューボタン -->
					<div class="relative">
						<button
							onclick={() => showMenu = !showMenu}
							class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
							</svg>
						</button>

						{#if showMenu}
							<div class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-48 z-50">
								<button
									onclick={saveDocument}
									class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
								>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
										<polyline points="17,21 17,13 7,13 7,21" />
										<polyline points="7,3 7,8 15,8" />
									</svg>
									保存
								</button>
								<hr class="my-1 border-gray-100" />
								<button
									onclick={deleteDocument}
									class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
								>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="3,6 5,6 21,6" />
										<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
									</svg>
									削除
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- メインコンテンツ -->
	<main class="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
		<!-- カバー画像エリア（将来の拡張用） -->

		<!-- 絵文字とタイトル -->
		<div class="mb-8">
			<!-- 絵文字 -->
			<div class="relative inline-block mb-4">
				<button
					onclick={() => showEmojiPicker = !showEmojiPicker}
					class="text-6xl sm:text-7xl hover:opacity-80 transition-opacity cursor-pointer"
				>
					{emoji}
				</button>

				{#if showEmojiPicker}
					<div class="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-40 w-80">
						<div class="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">アイコンを選択</div>
						<div class="grid grid-cols-8 gap-1">
							{#each commonEmojis as e}
								<button
									onclick={() => selectEmoji(e)}
									class="text-2xl p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
								>
									{e}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- タイトル -->
			<input
				type="text"
				bind:value={title}
				oninput={scheduleAutoSave}
				placeholder="無題"
				class="w-full text-4xl sm:text-5xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-300"
				style="letter-spacing: -0.02em; line-height: 1.2;"
			/>
		</div>

		<!-- エディター -->
		<div class="notion-content">
			<RichTextEditor
				bind:content={content}
				placeholder="'/' を入力してブロックを追加..."
				onchange={scheduleAutoSave}
			/>
		</div>

		<!-- ヘルプテキスト -->
		<div class="mt-16 text-center">
			<p class="text-sm text-gray-300">
				テキストを選択して書式設定 · '/' でブロックメニュー · Ctrl+S で保存
			</p>
		</div>
	</main>
</div>

<!-- オーバーレイ -->
{#if showEmojiPicker || showMenu}
	<button
		type="button"
		class="fixed inset-0 z-30"
		onclick={() => { showEmojiPicker = false; showMenu = false; }}
		aria-label="閉じる"
	></button>
{/if}

<style>
	/* Notion風のフォント */
	:global(body) {
		font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
	}

	.notion-content {
		color: #37352f;
	}
</style>
