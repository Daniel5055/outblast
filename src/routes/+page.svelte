<script lang="ts">
	import Board from "../lib/Board.svelte";
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
    if (frameTime - currentTime > 1000) {
      currentTime = frameTime
      console.log(frames, frameTime)
      frames = 0;
    } else {
      frames++
    }
  }
</script>

<div id="main">
  <Board time={frameTime} />
</div>

<style lang="css">
  #main {
    width: 100vw;
    height: 100vh
  }
</style>
