<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { data, children } = $props();
</script>

<div class="flex min-h-screen bg-slate-100">
	<Sidebar email={data.user?.email || 'user@example.com'} />
	<main class="flex-1 overflow-auto">
		{@render children()}
	</main>
</div>
