<script lang="ts">
	import { onMount } from "svelte";


  let frameTime = 0;
  let currentTime = 0;
  let frames = 0;
  onMount(() => {
    let frameId: number;
    const frame = (time: number) => {
      frameTime = time;
      frameId = requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    return () => cancelAnimationFrame(frameId);
  })

  $: {
    if (performance.now() - currentTime > 1000) {
      currentTime = performance.now()
      console.log(frames, frameTime)
      frames = 0;
    } else {
      frames++
    }
  }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
