<script>
	import '../app.css';
	import Header from './header.svelte';
    import { _auth } from "$lib/store.svelte.js";
	import  Auth  from "./auth.svelte"
	import { Toaster } from "$lib/components/ui/sonner";
	let { children } = $props();
</script>

<Toaster />
<!-- {#if _auth.is_authenticated} -->
    <div class="app mt-10">
        <Header/>
        <main>
            {@render children?.()}
        </main>
    </div>
<!-- {:else}
    <Auth/>
{/if} -->
<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	html {
		scroll-behavior: smooth;
	}

</style>
