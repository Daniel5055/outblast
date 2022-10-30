<script lang="ts">
	import  {createBody, type OBody, type PBody } from '../utils/types/Bodies';
	import {  onMount } from 'svelte';

  export let time: number;

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

  onMount(() => {
    /*
    d3.select('#board').selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => centerX + Math.cos(d.angle) * d.orbitDistance)
      .attr('cy', (d, i) => centerY - Math.sin(d.angle) * d.orbitDistance)
      .attr('r', (d, i) => d.radius)
      .attr('class', 'o-body')
    */

    const b = bodies[1]
    b.players.push({
      name: "Daniel",
      vx: 0,
      vy: 0,
      cx: b.x + b.radius,
      cy: b.y,
      radius: 15,
    })

  })

  $: {
    bodies = bodies.map((body) => {
      body.orbitAngle = body.orbitDistance === 0 ? 0 :(time % body.orbitPeriod) / body.orbitPeriod * (body.orbitClockwise ? 2 : -2) * Math.PI;
      body.rotationAngle = (time % body.rotationPeriod) / body.rotationPeriod * (body.rotateClockwise ? -360 : 360) ;
      return body
    })
  }
</script>

<svg 
  id='board'
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1000 1000"
  height="100%"
  width="100%"
  >
  {#each bodies as body}
    <g
        transform={`rotate(${body.rotationAngle} ${body.x} ${body.y})`}
    >
      <circle
        cx={body.x}
        cy={body.y}
        r={body.radius}/>

      {#each body.players as player}
        <circle
          cx={body.x + body.radius}
          cy={body.y}
          r={player.radius} />
      {/each}
    </g>
  {/each}

</svg>