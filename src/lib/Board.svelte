<script lang="ts">
  import * as d3 from 'd3';
	import { createBody, type OBody } from '../utils/types/Bodies';
	import { onMount } from 'svelte';

  export let time: number;

  const centerX = 500;
  const centerY = 500;

  const createCenteredBody = createBody.bind(null, centerX, centerY)

  let bodies: OBody[] = [createCenteredBody({
    name: 'Core',
    radius: 100,
    angle: 0,
    orbitDistance: 0,
    orbitPeriod: 0,
    rotationPeriod: 10000,
  }),
  createCenteredBody({
    name: 'Body',
    radius: 50,
    angle: 0,
    orbitDistance: 300,
    orbitPeriod: 5000,
    rotationPeriod: 5000,

  }),
  createCenteredBody({
    name: 'Body',
    radius: 50,
    angle: 20,
    orbitDistance: 500,
    orbitPeriod: 1000,
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
  })

  $: {bodies.forEach((body) => {
    body.move(time);
    })
    bodies = bodies
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
    <circle
      cx={body.x}
      cy={body.y}
      r={body.radius}></circle>
    
  {/each}

</svg>