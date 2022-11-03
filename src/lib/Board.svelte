<script lang="ts">
	import { createBody, type Body } from '../utils/types/body';
	import { onMount } from 'svelte';
	import { randomisePlanets } from '../utils/maps/base';
	import { applyAcceleration, damp, move } from '../utils/functions/orbiter';
	import { createBullet, createPlayer, type Orbiter, type Player } from '../utils/types/orbiter';

	let stop = false;
	export let time: number;
	export let step: number;
	export let playerWon: (name: string | null) => void;
	export let players: {
		name: string;
		keys: { left: string; right: string; eject: string; fire: string };
	}[];

	let frameOver = false;
	let gameOver = false;

	const onkeyDownMappings = Object.fromEntries(
		players
			.map((player) => Object.entries(player.keys))
			.flatMap((keys, i) =>
				keys.map(([input, key]): [string, () => void] => {
					switch (input) {
						case 'eject':
							return [key, () => eject(playerObjects[i])];
						case 'fire':
							return [key, () => fire(playerObjects[i])];
						case 'left':
							return [
								key,
								() =>
									(playerObjects[i].cannonMovement = Math.min(
										playerObjects[i].cannonMovement + 1,
										1
									) as 0 | 1)
							];
						case 'right':
							return [
								key,
								() =>
									(playerObjects[i].cannonMovement = Math.max(
										playerObjects[i].cannonMovement - 1,
										-1
									) as 0 | -1)
							];
						default:
							throw new Error(`Unknown input type "${input}"`);
					}
				})
			)
	);

	const onkeyUpMappings = Object.fromEntries(
		players
			.map((player) => Object.entries(player.keys))
			.flatMap((keys, i) =>
				keys.map(([input, key]): [string | undefined, (() => void) | undefined] => {
					switch (input) {
						case 'left':
							return [key, () => (playerObjects[i].cannonMovement -= 1)];
						case 'right':
							return [key, () => (playerObjects[i].cannonMovement += 1)];
						default:
							return [undefined, undefined];
					}
				})
			)
			.filter((entry) => entry[0] !== undefined)
	);

	const centerX = 500;
	const centerY = 500;

	let winner: Player | null | undefined = undefined;

	const gravConst = 40;
	const ejectConst = 0.03;
	const fireConst = 0.04;
	const dampConst = 0.00001;

	const createCenteredBody = createBody.bind(null, centerX, centerY);

	let playerObjects = players.map((player, i) =>
		createPlayer({
			id: `p${i + 1}`,
			name: player.name,
			cannonAngle: Math.PI / 2,
			target: null
		})
	);

	let bodies = [
		createCenteredBody({
			name: 'Core',
			radius: 100,
			startOrbitAngle: 0,
			orbitClockwise: true,
			rotateClockwise: false,
			orbitDistance: 0,
			orbitPeriod: 0,
			rotationPeriod: 10000,
			bulletProg: 0
		}),
		createCenteredBody({
			name: 'Body1',
			radius: 50,
			startOrbitAngle: 3,
			orbitClockwise: false,
			rotateClockwise: false,
			orbitDistance: 250,
			orbitPeriod: 25000,
			rotationPeriod: 5000,
			bulletProg: 4
		}),
		createCenteredBody({
			name: 'Body2',
			radius: 50,
			startOrbitAngle: 0,
			orbitClockwise: false,
			rotateClockwise: true,
			orbitDistance: 500,
			orbitPeriod: 15000,
			rotationPeriod: 10000,
			bulletProg: 4
		}),
		createCenteredBody({
			name: 'Body3',
			radius: 40,
			startOrbitAngle: 2 * Math.PI,
			orbitClockwise: true,
			rotateClockwise: false,
			orbitDistance: 390,
			orbitPeriod: 12000,
			rotationPeriod: 8000,
			bulletProg: 4
		}),
		createCenteredBody({
			name: 'Body4',
			radius: 40,
			startOrbitAngle: Math.PI / 2,
			orbitClockwise: true,
			rotateClockwise: true,
			orbitDistance: 400,
			orbitPeriod: 12000,
			rotationPeriod: 5000,
			bulletProg: 5
		})
	];

	//let bodies = randomisePlanets(centerX, centerY, 4);

	let orbiters: Orbiter[] = [];

	onMount(() => {
		// Add the players to the central body, equally spaced
		playerObjects.forEach((player, i) =>
			addPlayer(player, bodies[0], (i * 2 * Math.PI) / players.length + Math.PI / 2)
		);
	});

	const cannonMovement = 0.05 / 17;
	const cannonEdge = 0.5;

	$: { time; frameOver = false}
	$: if (!stop && !frameOver) {
		frameOver = true
		bodies = bodies.map((body) => {
			body.orbitAngle =
				body.orbitDistance === 0
					? 0
					: ((time % body.orbitPeriod) / body.orbitPeriod) *
							(body.orbitClockwise ? 2 : -2) *
							Math.PI +
					  body.startOrbitAngle;
			body.rotationAngle =
				((time % body.rotationPeriod) / body.rotationPeriod) *
				(body.rotateClockwise ? 2 : -2) *
				Math.PI;
			body.bulletProg = body.bulletProg + 0.0001 * body.radius;
			return body;
		});

		orbiters.forEach((orbiter) => {
			// Apply gravity

			const distance = Math.sqrt(
				Math.pow(centerX - orbiter.x, 2) + Math.pow(centerY - orbiter.y, 2)
			);
			const angle =
				Math.atan((centerY - orbiter.y) / -(centerX - orbiter.x)) +
				(centerX > orbiter.x ? Math.PI : 0);

			// Currently disobeying gravity hahah
			const g = gravConst / 100000;
			damp(orbiter, dampConst, step);
			applyAcceleration(
				orbiter,
				Math.cos(angle + Math.PI) * g,
				-Math.sin(angle + Math.PI) * g,
				step
			);
			move(orbiter, step);
			checkCollisions(orbiter);
			return orbiter;
		});
		orbiters = orbiters;

		playerObjects = playerObjects.map((p) => {
			if (p.cannonMovement > 0 && p.cannonAngle < Math.PI - cannonEdge) {
				p.cannonAngle += cannonMovement * step;
			} else if (p.cannonMovement < 0 && p.cannonAngle > cannonEdge) {
				p.cannonAngle -= cannonMovement * step;
			}
			return p;
		});
	}

	function onKeyDown(e: KeyboardEvent) {
		if (winner === undefined) {
			onkeyDownMappings[e.key]?.();
		}
	}
	function onKeyUp(e: KeyboardEvent) {
		onkeyUpMappings[e.key]?.();
	}
	function eject(player: Player) {
		if (player.target !== null) {
			const b = player.target;
			player.target = null;

			b.players.splice(b.players.indexOf(player), 1);

			const rotAngle = player.targetAngle + b.rotationAngle;
			// Calculated new player position
			player.x = b.x + Math.cos(rotAngle) * b.radius;
			player.y = b.y - Math.sin(rotAngle) * b.radius;

			// Calculate new speed
			const distance = Math.sqrt(Math.pow(centerX - player.x, 2) + Math.pow(centerY - player.y, 2));
			const raw = Math.atan((centerY - player.y) / -(centerX - player.x));
			const angle = centerX > player.x ? raw + Math.PI : raw;

			player.vx =
				(Math.cos(rotAngle + Math.PI / 2) * 2 * b.radius * Math.PI) / b.rotationPeriod +
				(b.orbitPeriod === 0
					? 0
					: (Math.cos(angle + Math.PI / 2) * distance * 2 * Math.PI) / b.orbitPeriod);
			player.vy =
				(-Math.sin(rotAngle + Math.PI / 2) * 2 * b.radius * Math.PI) / b.rotationPeriod -
				(b.orbitPeriod === 0
					? 0
					: (Math.sin(angle + Math.PI / 2) * distance * 2 * Math.PI) / b.orbitPeriod);
			player.ignore = b;

			applyAcceleration(
				player,
				Math.cos(rotAngle + player.cannonAngle - Math.PI / 2) * ejectConst,
				-Math.sin(rotAngle + player.cannonAngle - Math.PI / 2) * ejectConst,
				step
			);
			orbiters.push(player);
			orbiters = orbiters;

			setTimeout(() => {
				if (player.target === null && player.ignore === b) {
					player.ignore = null;
				}
			}, 1000);
		}
	}

	function checkCollisions(orbiter: Orbiter) {
		const oCollider = orbiters.find((o) => {
			if (orbiter === o) return false;
			return doesCollide(o.x, o.y, o.radius, orbiter.x, orbiter.y, orbiter.radius);
		});

		if (oCollider) {
			explode(oCollider);
			explode(orbiter);

			// If players are killed in collision
			if (!oCollider.explode && !orbiter.explode) {
				doubleKill(oCollider as Player, orbiter as Player);
			} else {
				!oCollider.explode && kill(oCollider as Player);
				!orbiter.explode && kill(orbiter as Player);
			}
			return;
		}

		const bCollider = bodies.find((b) => {
			if (b === (orbiter as Player).ignore) return;
			return doesCollide(orbiter.x, orbiter.y, orbiter.radius, b.x, b.y, b.radius);
		});

		if (bCollider) {
			// Check if player in range
			const collision = bCollider.players.some((player: Player) => {
				const rotAngle = player.targetAngle + bCollider.rotationAngle;
				const px = bCollider.x + Math.cos(rotAngle) * bCollider.radius;
				const py = bCollider.y - Math.sin(rotAngle) * bCollider.radius;
				if (doesCollide(orbiter.x, orbiter.y, orbiter.radius, px, py, player.radius)) {
					// If collision with player, player is garunteed dead
					bCollider.players.splice(bCollider.players.indexOf(player), 1);

					if (orbiter.explode) {
						doubleKill(orbiter as Player, player);
					} else {
						kill(player);
					}
					explode(orbiter);
					return true;
				}
				return false;
			});

			if (collision) {
				return
			}

			if (orbiter.explode) {
				explode(orbiter)
			} else {
				stick(orbiter as Player, bCollider);
			}
		}
	}

	function doesCollide(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) {
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) < r1 + r2;
	}

	function stick(player: Player, body: Body) {
		orbiters.splice(orbiters.indexOf(player), 1);
		const angle =
			Math.atan((player.y - body.y) / -(player.x - body.x)) + (player.x < body.x ? Math.PI : 0);
		addPlayer(player, body, angle);
	}

	function addPlayer(player: Player, body: Body, angle: number) {
		player.targetAngle = (angle - body.rotationAngle) % (2 * Math.PI);
		player.vx = 0;
		player.vy = 0;
		player.x = Math.cos(player.targetAngle) * body.radius;
		player.y = -1 * Math.sin(player.targetAngle) * body.radius;
		player.target = body;
		player.cannonAngle = Math.PI / 2;
		body.players.push(player);
		bodies = bodies;
	}

	function fire(player: Player) {
		const b = player.target;
		if (b === null) return;
		if (b.bulletProg < 1) return;
		b.bulletProg -= 1;

		const rotAngle = player.targetAngle + b.rotationAngle;
		const bullet = createBullet({
			id: 'bullet',
			name: 'bullet',
			x: b.x + Math.cos(rotAngle) * b.radius,
			y: b.y - Math.sin(rotAngle) * b.radius,
			vx: (Math.cos(rotAngle + Math.PI / 2) * 2 * b.radius * Math.PI) / b.rotationPeriod,
			vy: (-Math.sin(rotAngle + Math.PI / 2) * 2 * b.radius * Math.PI) / b.rotationPeriod,
			ignore: b
		});

		applyAcceleration(
			bullet,
			Math.cos(rotAngle + player.cannonAngle - Math.PI / 2) * fireConst,
			-Math.sin(rotAngle + player.cannonAngle - Math.PI / 2) * fireConst,
			step
		);
		orbiters.push(bullet);
		orbiters = orbiters;

		setTimeout(() => {
			if (bullet.ignore === b) {
				bullet.ignore = null;
			}
		}, 1000);
	}

	function explode(orbiter: Orbiter) {
		orbiters.splice(orbiters.indexOf(orbiter), 1);
	}

	function kill(player: Player) {
		playerObjects.splice(playerObjects.findIndex((p) => p.id === player.id), 1);
		if (playerObjects.length === 1 && winner == undefined) {
			winner = playerObjects[0];
			playerWon(winner.name);
		}
	}

	function doubleKill(player1: Player, player2: Player) {
		playerObjects.splice(playerObjects.findIndex((p) => p.id === player1.id), 1);
		playerObjects.splice(playerObjects.findIndex((p) => p.id === player2.id), 1);
		if (winner === undefined) {
			if (playerObjects.length === 1) {
				winner = playerObjects[0];
				playerWon(winner.name);
			} else if (playerObjects.length === 0 ) {
				winner = null;
				playerWon(null);
			}
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

{#if winner !== undefined}
	<h1 id="lost">{winner === null ? 'You both lose!' : winner.name + ' won!'}</h1>
{/if}

<h1 id="title">OutBlast</h1>

<div id="left">Player 1 (red): wasd</div>

<div id="right">Player 2 (blue): arrow keys</div>

<svg
	id="board"
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 1000 1000"
	height="100%"
	width="100%"
>
	{#each orbiters as orbiter}
		<circle class={orbiter.id} cx={orbiter.x} cy={orbiter.y} r={orbiter.radius} />
	{/each}
	{#each bodies as body}
		<g>
			<g transform={`rotate(${(body.rotationAngle / Math.PI) * -180} ${body.x} ${body.y})`}>
				{#each body.players as player}
					<rect
						class="cannon"
						transform={`rotate(${
							(-player.targetAngle * 180) / Math.PI - (player.cannonAngle * 180) / Math.PI
						} ${body.x + player.x} ${body.y + player.y})`}
						x={body.x + player.x - player.cannonWidth / 2}
						y={body.y + player.y - player.cannonWidth / 2}
						width={player.cannonWidth}
						height={player.cannonHeight}
					/>
					<circle
						class={player.id}
						cx={body.x + player.x}
						cy={body.y + player.y}
						r={player.radius}
					/>
				{/each}
				<circle class="body" cx={body.x} cy={body.y} r={body.radius} />
				<circle class="spot" cx={body.x + (body.radius / 4) * 3} cy={body.y} r={5} />
			</g>
			<text
				x={body.x}
				y={body.y}
				dominant-baseline="middle"
				text-anchor="middle"
				font-size="{0.03 * body.radius}rem "
			>
				{body.bullets}
			</text>
		</g>
	{/each}
</svg>

<style>
	.body {
		fill: grey;
	}
	.spot {
		fill: #444;
	}

	#title {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		margin: 0;
	}

	#lost {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		-webkit-text-stroke: 1px black;
	}

	#left {
		position: fixed;
		left: 10px;
		top: 10px;
		color: white;
	}

	#right {
		position: fixed;
		top: 10px;
		right: 10px;
		color: white;
	}

	.p1 {
		fill: firebrick;
	}
	.p2 {
		fill: teal;
	}
	.cannon {
		fill: #888;
	}
	.bullet {
		fill: goldenrod;
		stroke: whitesmoke;
	}
</style>
