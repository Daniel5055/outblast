<script lang="ts">
	import Board from '../lib/Board.svelte';
	import { onMount } from 'svelte';

	const players = [
		{
			name: 'Player 1',
			keys: {
				eject: 'w',
				left: 'a',
				fire: 's',
				right: 'd'
			}
		},
		{
			name: 'Player 2',
			keys: {
				eject: 'ArrowUp',
				left: 'ArrowLeft',
				fire: 'ArrowDown',
				right: 'ArrowRight'
			}
		}
	];

	const scores = Object.fromEntries(players.map((player) => [player.name, 0]));

	const playerWon = (name: string | null) => {
		if (name !== null) {
			scores[name]++;
		}
	}

	let frameTime = 0;
	let prevFrameTime = 0;
	onMount(() => {
		let frameId: number;
		const frame = (time: number) => {
			prevFrameTime = frameTime;
			frameTime = time;
			frameId = requestAnimationFrame(frame);
		};
		requestAnimationFrame(frame);

		return () => cancelAnimationFrame(frameId);
	});
</script>

<div id="main">
	<Board time={frameTime} step={frameTime - prevFrameTime} players={players} playerWon={playerWon} />
</div>

<style lang="css">
	:global(body) {
		margin: 0;
		background-image: url(https://opengameart.org/sites/default/files/bg_space_seamless_1.png);
		font-family: Verdana, Geneva, Tahoma, sans-serif;
		color: white;
	}
	#main {
		width: 100vw;
		height: 99vh;
	}
</style>
