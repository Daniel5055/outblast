<script lang="ts">
	import  {createBody, type OBody, type PBody } from '../utils/types/Bodies';
	import {  onMount } from 'svelte';

  export let time: number;
  let stop = false

  const centerX = 500;
  const centerY = 500;

  const createCenteredBody = createBody.bind(null, centerX, centerY)

  let bodies: OBody[] = [createCenteredBody({
      name: 'Core',
      radius: 100,
      startOrbitAngle: 0,
      orbitClockwise: true,
      rotateClockwise: true,
      orbitDistance: 0,
      orbitPeriod: 0,
      rotationPeriod: 10000,
    }),
    createCenteredBody({
      name: 'Body',
      radius: 50,
      startOrbitAngle: 0,
      orbitClockwise: true,
      rotateClockwise: true,
      orbitDistance: 300,
      orbitPeriod: 5000,
      rotationPeriod: 5000,
    }),
    createCenteredBody({
      name: 'Body',
      radius: 50,
      startOrbitAngle: 0,
      orbitClockwise: true,
      rotateClockwise: true,
      orbitDistance: 500,
      orbitPeriod: 10000,
      rotationPeriod: 5000,

    }),
  ]

  let orbiters: PBody[] = [];

  onMount(() => {
    /*
    d3.select('#board').selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => centerX + Math.cos(d.angle) * d.orbitDistance)
      .attr('cy', (d, i) => centerY - Math.sin(d.angle) * d.orbitDistance)
      .attr('r', (d, i) => d.null
      console.log('remradius)
      .attr('class', 'o-body')
    */

    const b = bodies[1]
    const angle = 0;
    b.players.push({
      name: "Daniel",
      vx: 0,
      vy: 0,
      targetAngle: angle,
      x: Math.cos(angle) * b.radius,
      y: -1 * Math.sin(angle) * b.radius,
      radius: 15,
      target: b,
    })

  })

  $: {
    if (!stop) {
    bodies = bodies.map((body) => {
      body.orbitAngle = body.orbitDistance === 0 ? 0 :(time % body.orbitPeriod) / body.orbitPeriod * (body.orbitClockwise ? 2 : -2) * Math.PI;
      body.rotationAngle = (time % body.rotationPeriod) / body.rotationPeriod * (body.rotateClockwise ? -2 : 2) * Math.PI;
      return body
    })
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'w') {
      console.log('press')
      eject(bodies[1].players[0])
    }
  
  }
  function eject(player: PBody) {
    if (player.target !== null) {
      const b = player.target
      player.target = null;

      b.players.splice(b.players.indexOf(player), 1);
      console.log('removed')

      // Calculated new player position
      player.x = b.x + Math.cos(player.targetAngle + b.rotationAngle) * b.radius
      player.y = b.y + Math.sin(player.targetAngle + b.rotationAngle) * b.radius
      orbiters.push(player)
      orbiters = orbiters
      stop = true
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} />

<svg 
  id='board'
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1000 1000"
  height="100%"
  width="100%"
  >
  {#each bodies as body}
    <g
        transform={`rotate(${body.rotationAngle / Math.PI * 180} ${body.x} ${body.y})`}
    >
      <circle
        fill="transparent"
        stroke="black"
        cx={body.x}
        cy={body.y}
        r={body.radius}/>

      {#each body.players as player}
        <circle
          cx={body.x + player.x}
          cy={body.y + player.y}
          r={player.radius} />
      {/each}
    </g>
  {/each}

  {#each orbiters as orbiter}
    <circle
      cx={orbiter.x}
      cy={orbiter.y}
      r={orbiter.radius} />
  {/each}
</svg>