<script lang="ts">
	type IconName =
		| 'wallet' | 'chart-up' | 'chart-down' | 'balance' | 'bank' | 'investment'
		| 'food' | 'utility' | 'phone' | 'transport' | 'home' | 'medical' | 'entertainment' | 'clothing' | 'education'
		| 'salary' | 'bonus' | 'plus' | 'minus' | 'list' | 'report' | 'logout' | 'check' | 'warning' | 'sparkle'
		| 'document' | 'folder' | 'edit' | 'trash' | 'chevron-right' | 'chevron-down' | 'bold' | 'italic' | 'underline' | 'heading' | 'list-bullet' | 'list-number' | 'link' | 'image' | 'code';

	let { name, size = 24, class: className = '' }: { name: IconName; size?: number; class?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
>
	{#if name === 'wallet'}
		<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
		<path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
		<path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
	{:else if name === 'chart-up'}
		<path d="M3 3v18h18" />
		<path d="m19 9-5 5-4-4-3 3" />
	{:else if name === 'chart-down'}
		<path d="M3 3v18h18" />
		<path d="m19 15-5-5-4 4-3-3" />
	{:else if name === 'balance'}
		<path d="M12 3v18" />
		<path d="M8 7h8" />
		<path d="M6 11h12" />
		<path d="M8 15h8" />
		<path d="M10 19h4" />
	{:else if name === 'bank'}
		<path d="M3 21h18" />
		<path d="M3 10h18" />
		<path d="M12 3l9 7H3l9-7Z" />
		<path d="M5 10v11" />
		<path d="M19 10v11" />
		<path d="M9 10v11" />
		<path d="M15 10v11" />
	{:else if name === 'investment'}
		<path d="M12 2v20" />
		<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
	{:else if name === 'food'}
		<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
		<path d="M7 2v20" />
		<path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
	{:else if name === 'utility'}
		<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
		<path d="M9 18h6" />
		<path d="M10 22h4" />
	{:else if name === 'phone'}
		<rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
		<path d="M12 18h.01" />
	{:else if name === 'transport'}
		<path d="M8 6v6" />
		<path d="M16 6v6" />
		<path d="M2 12h20" />
		<path d="M7 18h10" />
		<path d="M18 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
		<circle cx="7" cy="18" r="2" />
		<circle cx="17" cy="18" r="2" />
	{:else if name === 'home'}
		<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
		<polyline points="9,22 9,12 15,12 15,22" />
	{:else if name === 'medical'}
		<path d="M8 2v4" />
		<path d="M16 2v4" />
		<rect width="18" height="18" x="3" y="4" rx="2" />
		<path d="M12 10v6" />
		<path d="M9 13h6" />
	{:else if name === 'entertainment'}
		<rect width="18" height="18" x="3" y="3" rx="2" />
		<path d="m9 8 6 4-6 4Z" />
	{:else if name === 'clothing'}
		<path d="M6.5 2H11v2.5" />
		<path d="M17.5 2H13v2.5" />
		<path d="M6.5 2 2 7l3 3v12h14V10l3-3-4.5-5" />
	{:else if name === 'education'}
		<path d="M22 10v6M2 10l10-5 10 5-10 5z" />
		<path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
	{:else if name === 'salary'}
		<circle cx="12" cy="12" r="10" />
		<path d="M12 6v12" />
		<path d="M15 9H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H8" />
	{:else if name === 'bonus'}
		<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
	{:else if name === 'plus'}
		<circle cx="12" cy="12" r="10" />
		<path d="M8 12h8" />
		<path d="M12 8v8" />
	{:else if name === 'minus'}
		<circle cx="12" cy="12" r="10" />
		<path d="M8 12h8" />
	{:else if name === 'list'}
		<line x1="8" x2="21" y1="6" y2="6" />
		<line x1="8" x2="21" y1="12" y2="12" />
		<line x1="8" x2="21" y1="18" y2="18" />
		<line x1="3" x2="3.01" y1="6" y2="6" />
		<line x1="3" x2="3.01" y1="12" y2="12" />
		<line x1="3" x2="3.01" y1="18" y2="18" />
	{:else if name === 'report'}
		<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
		<polyline points="14,2 14,8 20,8" />
		<path d="M12 18v-6" />
		<path d="M8 18v-1" />
		<path d="M16 18v-3" />
	{:else if name === 'logout'}
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
		<polyline points="16,17 21,12 16,7" />
		<line x1="21" x2="9" y1="12" y2="12" />
	{:else if name === 'check'}
		<path d="M20 6 9 17l-5-5" />
	{:else if name === 'warning'}
		<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
		<line x1="12" x2="12" y1="9" y2="13" />
		<line x1="12" x2="12.01" y1="17" y2="17" />
	{:else if name === 'sparkle'}
		<path d="M12 3v18" />
		<path d="M18.5 8.5L5.5 15.5" />
		<path d="M5.5 8.5l13 7" />
	{:else if name === 'document'}
		<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
		<polyline points="14,2 14,8 20,8" />
	{:else if name === 'folder'}
		<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
	{:else if name === 'edit'}
		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
		<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
	{:else if name === 'trash'}
		<polyline points="3,6 5,6 21,6" />
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
	{:else if name === 'chevron-right'}
		<polyline points="9,18 15,12 9,6" />
	{:else if name === 'chevron-down'}
		<polyline points="6,9 12,15 18,9" />
	{:else if name === 'bold'}
		<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
		<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
	{:else if name === 'italic'}
		<line x1="19" x2="10" y1="4" y2="4" />
		<line x1="14" x2="5" y1="20" y2="20" />
		<line x1="15" x2="9" y1="4" y2="20" />
	{:else if name === 'underline'}
		<path d="M6 4v6a6 6 0 0 0 12 0V4" />
		<line x1="4" x2="20" y1="20" y2="20" />
	{:else if name === 'heading'}
		<path d="M6 12h12" />
		<path d="M6 4v16" />
		<path d="M18 4v16" />
	{:else if name === 'list-bullet'}
		<line x1="8" x2="21" y1="6" y2="6" />
		<line x1="8" x2="21" y1="12" y2="12" />
		<line x1="8" x2="21" y1="18" y2="18" />
		<circle cx="4" cy="6" r="1" fill="currentColor" />
		<circle cx="4" cy="12" r="1" fill="currentColor" />
		<circle cx="4" cy="18" r="1" fill="currentColor" />
	{:else if name === 'list-number'}
		<line x1="10" x2="21" y1="6" y2="6" />
		<line x1="10" x2="21" y1="12" y2="12" />
		<line x1="10" x2="21" y1="18" y2="18" />
		<path d="M4 6h2v4" />
		<path d="M4 10h2" />
		<path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
	{:else if name === 'link'}
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
		<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
	{:else if name === 'image'}
		<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
		<circle cx="8.5" cy="8.5" r="1.5" />
		<polyline points="21,15 16,10 5,21" />
	{:else if name === 'code'}
		<polyline points="16,18 22,12 16,6" />
		<polyline points="8,6 2,12 8,18" />
	{/if}
</svg>
