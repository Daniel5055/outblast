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
		winner = name;
	};

	let frameTime = 0;
	let prevFrameTime = 0;
	let frameTimeStart = 0;
	let winner: string | null | undefined = undefined;
	let refresh = false;

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

	function onKeyDown(e: KeyboardEvent) {
		if (winner !== undefined && e.key === ' ') {
			reset();
		}
	}

	function reset() {
		if (winner != null) {
			scores[winner]++;
		}
		refresh = true;
		winner = undefined;
		frameTimeStart = frameTime;
		setTimeout(() => (refresh = false), 0);
	}
</script>

{#key refresh}
	<Board time={frameTime - frameTimeStart} step={frameTime - prevFrameTime} {players} {playerWon} />
{/key}

<svelte:window on:keydown={onKeyDown} />

<h1 id="title" class="overlay">OutBlast</h1>

<div id="left" class="overlay">
	<p>Player 1 (red): wasd</p>
	<p class="score">{scores[players[0].name]}</p>
</div>

<div id="right" class="overlay">
	<p>Player 2 (blue): arrow keys</p>
	<p class="score">{scores[players[1].name]}</p>
</div>

{#if winner !== undefined}
<div id="won" class="overlay">
	<h1>{winner === null ? 'You both lose!' : winner + ' won!'}</h1>
	<p>Press space to play again</p>
</div>
{/if}

<style lang="css">
	:global(body) {
		margin: 0;
		background-image: url(https://opengameart.org/sites/default/files/bg_space_seamless_1.png);
		font-family: Verdana, Geneva, Tahoma, sans-serif;
		color: white;
		--player1-colour: firebrick;
		--player2-colour: teal;
	}

	.overlay {
		position: fixed;
	}
	.overlay p {
		margin-top: 0;
		margin-bottom: 0;
	}

	.overlay .score {
		margin: 10px 20px;
		color: var(--player-colour);
	}

	#left {
		left: 10px;
		top: 10px;
		text-align: left;
		--player-colour: var(--player1-colour);
	}

	#title {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		margin: 0;
	}

	#right {
		position: fixed;
		top: 10px;
		right: 10px;
		text-align: right;
		--player-colour: var(--player2-colour);
	}

	#won {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}

	#won h1 {
		-webkit-text-stroke: 1px black;
		margin-bottom: 100px;
	}

</style>
