<script lang="ts">
	let {
		content = $bindable(''),
		placeholder = 'ここに内容を入力...',
		onchange = () => {}
	}: {
		content: string;
		placeholder?: string;
		onchange?: () => void;
	} = $props();

	let editor: HTMLDivElement;
	let showEmojiPicker = $state(false);
	let showColorMenu = $state(false);
	let showHighlightMenu = $state(false);
	let showBlockMenu = $state(false);

	const emojis = [
		'😀', '😊', '🎉', '✨', '💡', '🔥', '❤️', '⭐',
		'👍', '👏', '🙌', '💪', '🎯', '✅', '❌', '⚠️',
		'📌', '📎', '🔗', '💬', '📝', '📊', '📈', '💰',
		'🏠', '🚗', '✈️', '🍽️', '🛒', '💊', '📱', '💻'
	];

	const colors = [
		{ name: 'デフォルト', value: '#37352f' },
		{ name: '赤', value: '#e03e3e' },
		{ name: 'オレンジ', value: '#d9730d' },
		{ name: '緑', value: '#0f7b6c' },
		{ name: '青', value: '#0b6e99' },
		{ name: '紫', value: '#6940a5' }
	];

	const highlights = [
		{ name: 'なし', value: 'transparent', bg: 'bg-white border border-gray-200' },
		{ name: '黄色', value: '#fef3c7', bg: 'bg-amber-100' },
		{ name: 'ピンク', value: '#fce7f3', bg: 'bg-pink-100' },
		{ name: '青', value: '#dbeafe', bg: 'bg-blue-100' },
		{ name: '緑', value: '#dcfce7', bg: 'bg-green-100' },
		{ name: '紫', value: '#ede9fe', bg: 'bg-violet-100' }
	];

	// マーカー付き見出しテンプレート
	const headingTemplates = [
		{ label: '黄色見出し', bg: '#fef3c7', color: '#92400e', html: '<h2 style="background-color: #fef3c7; color: #92400e; padding: 0.5rem 1rem; border-radius: 4px; margin: 1rem 0;">見出しテキスト</h2>' },
		{ label: 'ピンク見出し', bg: '#fce7f3', color: '#9d174d', html: '<h2 style="background-color: #fce7f3; color: #9d174d; padding: 0.5rem 1rem; border-radius: 4px; margin: 1rem 0;">見出しテキスト</h2>' },
		{ label: '青見出し', bg: '#dbeafe', color: '#1e40af', html: '<h2 style="background-color: #dbeafe; color: #1e40af; padding: 0.5rem 1rem; border-radius: 4px; margin: 1rem 0;">見出しテキスト</h2>' },
		{ label: '緑見出し', bg: '#dcfce7', color: '#166534', html: '<h2 style="background-color: #dcfce7; color: #166534; padding: 0.5rem 1rem; border-radius: 4px; margin: 1rem 0;">見出しテキスト</h2>' },
		{ label: '紫見出し', bg: '#ede9fe', color: '#5b21b6', html: '<h2 style="background-color: #ede9fe; color: #5b21b6; padding: 0.5rem 1rem; border-radius: 4px; margin: 1rem 0;">見出しテキスト</h2>' },
		{ label: 'グレー見出し', bg: '#f3f4f6', color: '#374151', html: '<h2 style="background-color: #f3f4f6; color: #374151; padding: 0.5rem 1rem; border-radius: 4px; margin: 1rem 0;">見出しテキスト</h2>' }
	];

	const blockTypes = [
		{ label: 'テキスト', tag: 'p', icon: 'T' },
		{ label: '見出し1', tag: 'h1', icon: 'H1' },
		{ label: '見出し2', tag: 'h2', icon: 'H2' },
		{ label: '見出し3', tag: 'h3', icon: 'H3' },
		{ label: '箇条書き', tag: 'ul', icon: '•' },
		{ label: '番号リスト', tag: 'ol', icon: '1.' },
		{ label: '引用', tag: 'blockquote', icon: '"' },
		{ label: 'コード', tag: 'pre', icon: '</>' }
	];

	function execCommand(command: string, value: string | undefined = undefined) {
		document.execCommand(command, false, value);
		editor?.focus();
		updateContent();
	}

	function formatBlock(tag: string) {
		if (tag === 'ul') {
			execCommand('insertUnorderedList');
		} else if (tag === 'ol') {
			execCommand('insertOrderedList');
		} else {
			document.execCommand('formatBlock', false, tag);
		}
		showBlockMenu = false;
		editor?.focus();
		updateContent();
	}

	function setColor(color: string) {
		execCommand('foreColor', color);
		showColorMenu = false;
	}

	function setHighlight(color: string) {
		if (color === 'transparent') {
			execCommand('removeFormat');
		} else {
			execCommand('hiliteColor', color);
		}
		showHighlightMenu = false;
	}

	function insertEmoji(emoji: string) {
		document.execCommand('insertText', false, emoji);
		showEmojiPicker = false;
		editor?.focus();
		updateContent();
	}

	function insertHeadingTemplate(html: string) {
		document.execCommand('insertHTML', false, html);
		showBlockMenu = false;
		editor?.focus();
		updateContent();
	}

	function insertLink() {
		const url = prompt('URLを入力:');
		if (url) {
			execCommand('createLink', url);
		}
	}

	function insertHorizontalRule() {
		execCommand('insertHorizontalRule');
	}

	function updateContent() {
		if (editor) {
			content = editor.innerHTML;
			onchange();
		}
	}

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		const text = e.clipboardData?.getData('text/html') || e.clipboardData?.getData('text/plain') || '';
		document.execCommand('insertHTML', false, text);
		updateContent();
	}

	function handleInput() {
		updateContent();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
			e.preventDefault();
			execCommand('bold');
		}
		if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
			e.preventDefault();
			execCommand('italic');
		}
		if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
			e.preventDefault();
			execCommand('underline');
		}
	}

	function closeAllMenus() {
		showEmojiPicker = false;
		showColorMenu = false;
		showHighlightMenu = false;
		showBlockMenu = false;
	}

	$effect(() => {
		if (editor && editor.innerHTML !== content) {
			editor.innerHTML = content;
		}
	});
</script>

<div class="notion-editor">
	<!-- 固定ツールバー（薄い色で目立たない） -->
	<div class="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 px-2 py-1.5">
		<div class="flex flex-wrap items-center gap-0.5">
			<!-- ブロックタイプ -->
			<div class="relative">
				<button
					type="button"
					onclick={() => { closeAllMenus(); showBlockMenu = !showBlockMenu; }}
					class="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
				>
					<span>段落</span>
					<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="6,9 12,15 18,9" />
					</svg>
				</button>
				{#if showBlockMenu}
					<div class="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-64 z-30 max-h-80 overflow-y-auto">
						<div class="px-3 py-1 text-xs text-gray-400 font-medium">ブロックタイプ</div>
						{#each blockTypes as block}
							<button
								type="button"
								onclick={() => formatBlock(block.tag)}
								class="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
							>
								<span class="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-500">{block.icon}</span>
								<span>{block.label}</span>
							</button>
						{/each}
						<hr class="my-2 border-gray-100" />
						<div class="px-3 py-1 text-xs text-gray-400 font-medium">マーカー見出し</div>
						{#each headingTemplates as template}
							<button
								type="button"
								onclick={() => insertHeadingTemplate(template.html)}
								class="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
							>
								<span class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style="background-color: {template.bg}; color: {template.color}">H</span>
								<span class="text-gray-700">{template.label}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="w-px h-4 bg-gray-200 mx-1"></div>

			<!-- テキストスタイル -->
			<button type="button" onclick={() => execCommand('bold')} class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="太字">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				</svg>
			</button>
			<button type="button" onclick={() => execCommand('italic')} class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="斜体">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line x1="15" x2="9" y1="4" y2="20" />
				</svg>
			</button>
			<button type="button" onclick={() => execCommand('underline')} class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="下線">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" x2="20" y1="20" y2="20" />
				</svg>
			</button>
			<button type="button" onclick={() => execCommand('strikeThrough')} class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="取り消し線">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" x2="20" y1="12" y2="12" />
				</svg>
			</button>

			<div class="w-px h-4 bg-gray-200 mx-1"></div>

			<!-- 文字色 -->
			<div class="relative">
				<button
					type="button"
					onclick={() => { closeAllMenus(); showColorMenu = !showColorMenu; }}
					class="flex items-center gap-0.5 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
					title="文字色"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M4 20h16" /><path d="m6 16 6-12 6 12" /><path d="M8 12h8" />
					</svg>
				</button>
				{#if showColorMenu}
					<div class="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-30">
						<div class="flex gap-1">
							{#each colors as color}
								<button
									type="button"
									onclick={() => setColor(color.value)}
									class="w-6 h-6 rounded-full hover:scale-110 transition-transform border border-gray-200"
									style="background-color: {color.value}"
									title={color.name}
								></button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- ハイライト -->
			<div class="relative">
				<button
					type="button"
					onclick={() => { closeAllMenus(); showHighlightMenu = !showHighlightMenu; }}
					class="flex items-center gap-0.5 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
					title="マーカー"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
					</svg>
				</button>
				{#if showHighlightMenu}
					<div class="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-30">
						<div class="flex gap-1">
							{#each highlights as highlight}
								<button
									type="button"
									onclick={() => setHighlight(highlight.value)}
									class="w-6 h-6 rounded hover:scale-110 transition-transform {highlight.bg}"
									title={highlight.name}
								></button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<div class="w-px h-4 bg-gray-200 mx-1"></div>

			<!-- 絵文字 -->
			<div class="relative">
				<button
					type="button"
					onclick={() => { closeAllMenus(); showEmojiPicker = !showEmojiPicker; }}
					class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
					title="絵文字"
				>
					<span class="text-sm">😊</span>
				</button>
				{#if showEmojiPicker}
					<div class="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-30 w-52">
						<div class="grid grid-cols-8 gap-0.5">
							{#each emojis as emoji}
								<button
									type="button"
									onclick={() => insertEmoji(emoji)}
									class="p-1 text-lg hover:bg-gray-100 rounded transition-colors"
								>
									{emoji}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<div class="w-px h-4 bg-gray-200 mx-1"></div>

			<!-- リンク -->
			<button type="button" onclick={insertLink} class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="リンク">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
				</svg>
			</button>

			<!-- 区切り線 -->
			<button type="button" onclick={insertHorizontalRule} class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="区切り線">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="3" x2="21" y1="12" y2="12" />
				</svg>
			</button>

			<div class="w-px h-4 bg-gray-200 mx-1"></div>

			<!-- リスト -->
			<button type="button" onclick={() => execCommand('insertUnorderedList')} class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="箇条書き">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" />
					<circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" />
				</svg>
			</button>
			<button type="button" onclick={() => execCommand('insertOrderedList')} class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="番号リスト">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" />
					<path d="M4 6h2v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
				</svg>
			</button>
		</div>
	</div>

	<!-- エディター本体 -->
	<div
		bind:this={editor}
		contenteditable="true"
		role="textbox"
		aria-multiline="true"
		class="editor-content outline-none px-4 py-6"
		oninput={handleInput}
		onpaste={handlePaste}
		onkeydown={handleKeyDown}
		data-placeholder={placeholder}
	></div>
</div>

<!-- メニューを閉じるオーバーレイ -->
{#if showEmojiPicker || showColorMenu || showHighlightMenu || showBlockMenu}
	<button
		type="button"
		class="fixed inset-0 z-10"
		onclick={closeAllMenus}
		aria-label="メニューを閉じる"
	></button>
{/if}

<style>
	.editor-content {
		min-height: 50vh;
		font-size: 1rem;
		line-height: 1.75;
		color: #37352f;
		caret-color: #37352f;
	}

	.editor-content:empty:before {
		content: attr(data-placeholder);
		color: #9b9a97;
		pointer-events: none;
	}

	.editor-content:focus {
		outline: none;
	}

	/* Notion風見出しスタイル */
	.editor-content :global(h1) {
		font-size: 2.25rem;
		font-weight: 700;
		margin: 2rem 0 0.5rem;
		line-height: 1.2;
		color: #37352f;
		letter-spacing: -0.02em;
	}

	.editor-content :global(h2) {
		font-size: 1.75rem;
		font-weight: 600;
		margin: 1.75rem 0 0.5rem;
		line-height: 1.25;
		color: #37352f;
		letter-spacing: -0.01em;
	}

	.editor-content :global(h3) {
		font-size: 1.375rem;
		font-weight: 600;
		margin: 1.5rem 0 0.5rem;
		line-height: 1.3;
		color: #37352f;
	}

	.editor-content :global(p) {
		margin: 0.25rem 0;
		min-height: 1.75em;
	}

	.editor-content :global(ul),
	.editor-content :global(ol) {
		margin: 0.25rem 0;
		padding-left: 1.5rem;
	}

	.editor-content :global(ul) {
		list-style-type: disc;
	}

	.editor-content :global(ol) {
		list-style-type: decimal;
	}

	.editor-content :global(li) {
		margin: 0.125rem 0;
		padding-left: 0.25rem;
	}

	/* Notion風引用ブロック */
	.editor-content :global(blockquote) {
		border-left: 3px solid #37352f;
		padding: 0.5rem 0 0.5rem 1rem;
		margin: 0.5rem 0;
		color: #37352f;
		background: transparent;
		font-style: normal;
	}

	/* Notion風コードブロック */
	.editor-content :global(pre) {
		background-color: #f7f6f3;
		color: #37352f;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
		font-size: 0.875rem;
		margin: 0.5rem 0;
		line-height: 1.5;
	}

	.editor-content :global(a) {
		color: #37352f;
		text-decoration: underline;
		text-decoration-color: rgba(55, 53, 47, 0.4);
		text-underline-offset: 2px;
	}

	.editor-content :global(a:hover) {
		text-decoration-color: #37352f;
	}

	.editor-content :global(hr) {
		border: none;
		border-top: 1px solid #e5e5e5;
		margin: 1.5rem 0;
	}
</style>
