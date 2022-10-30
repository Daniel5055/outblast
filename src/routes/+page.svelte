<script lang="ts">
	import Board from "../lib/Board.svelte";
  import { onMount } from "svelte";

  let frameTime = 0;
  let prevFrameTime = 0;
  let currentTime = 0;
  let frames = 0;
  onMount(() => {
    let frameId: number;
    const frame = (time: number) => {
      prevFrameTime = frameTime
      frameTime = time;
      frameId = requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    return () => cancelAnimationFrame(frameId);
  })

  /*
  $: {
    if (frameTime - currentTime > 1000) {
      currentTime = frameTime
      console.log(frames, frameTime)
      frames = 0;
    } else {
      frames++
    }
  }
  */
</script>

<div id="main">
  <Board time={frameTime} step={frameTime - prevFrameTime} />
</div>

<style lang="css">
  :global(body) {
    margin: 0;
    background-image: url(https://opengameart.org/sites/default/files/bg_space_seamless_1.png);
    font-family: Verdana, Geneva, Tahoma, sans-serif;
  }
  #main {
    width: 100vw;
    height: 99vh
  }
</style>
