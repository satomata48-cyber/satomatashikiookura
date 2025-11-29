<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	type Document = {
		id: number;
		title: string;
		emoji: string;
		parent_id: number | null;
		is_folder: number;
		sort_order: number;
		created_at: string;
		updated_at: string;
	};

	let documents = $state<Document[]>(data.documents);
	let isCreating = $state(false);

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('ja-JP', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	async function createDocument() {
		isCreating = true;
		try {
			const res = await fetch('/api/documents', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: '無題', emoji: '📄' })
			});
			const { document } = await res.json();
			if (document) {
				goto(`/documents/${document.id}`);
			}
		} finally {
			isCreating = false;
		}
	}

	async function deleteDocument(id: number, e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (!confirm('このドキュメントを削除しますか？')) return;

		await fetch(`/api/documents/${id}`, { method: 'DELETE' });
		documents = documents.filter(d => d.id !== id);
	}
</script>

<svelte:head>
	<title>ドキュメント - 家計簿アプリ</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6">
	<!-- ヘッダー -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
				ドキュメント
			</h1>
			<p class="text-sm sm:text-base text-slate-500 mt-1">メモやノートを管理</p>
		</div>
		<button
			onclick={createDocument}
			disabled={isCreating}
			class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg shadow-lg hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50"
		>
			<Icon name="plus" size={20} />
			<span class="hidden sm:inline">新規作成</span>
		</button>
	</div>

	{#if documents.length === 0}
		<div class="bg-white/80 backdrop-blur rounded-2xl p-12 border border-slate-200/50 text-center shadow-xl">
			<div class="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
				<Icon name="document" size={40} class="text-violet-400" />
			</div>
			<p class="text-xl text-slate-600 font-medium">ドキュメントがありません</p>
			<p class="text-slate-400 mt-2">「新規作成」をクリックして最初のドキュメントを作成しましょう</p>
			<button
				onclick={createDocument}
				disabled={isCreating}
				class="mt-6 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg shadow-lg hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50"
			>
				<Icon name="plus" size={20} class="inline mr-2" />
				最初のドキュメントを作成
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each documents as doc}
				<a
					href="/documents/{doc.id}"
					class="group bg-white/80 backdrop-blur rounded-xl p-4 border border-slate-200/50 shadow-lg hover:shadow-xl hover:border-violet-300 transition-all"
				>
					<div class="flex items-start justify-between mb-3">
						<span class="text-3xl">{doc.emoji}</span>
						<button
							onclick={(e) => deleteDocument(doc.id, e)}
							class="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
						>
							<Icon name="trash" size={16} />
						</button>
					</div>
					<h3 class="font-semibold text-slate-800 truncate mb-1">
						{doc.title || '無題'}
					</h3>
					<p class="text-xs text-slate-400">
						{formatDate(doc.updated_at)}
					</p>
				</a>
			{/each}
		</div>
	{/if}
</div>
