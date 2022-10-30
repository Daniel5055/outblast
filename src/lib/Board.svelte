<script lang="ts">
  import * as d3 from 'd3';
	import type { OBody } from '../utils/types/Bodies';
	import { onMount } from 'svelte';

  export const time = 0;

  const centerX = 500;
  const centerY = 500;

  const data: OBody[] = [{
    name: 'Core',
    radius: 100,
    angle: 0,
    orbitDistance: 0,
    orbitPeriod: 0,
    rotationPeriod: 10000,
  },
  {
    name: 'Body',
    radius: 50,
    angle: 0,
    orbitDistance: 300,
    orbitPeriod: 5000,
    rotationPeriod: 5000,

  },
  {
    name: 'Body',
    radius: 50,
    angle: 20,
    orbitDistance: 500,
    orbitPeriod: 1000,
    rotationPeriod: 5000,

  }
]

  onMount(() => {
    d3.select('#board').selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => d.orbitDistance == 0 ? centerX : 0)
      .attr('cy', (d, i) => d.orbitDistance == 0 ? centerY : 0)
      .attr('r', (d, i) => d.radius)
      .attr('class', 'o-body')
      .filter((d, i) => d.orbitDistance != 0)
      .append('animateMotion')
      .attr('path', (d, i) => {
        const x = centerX + Math.cos(d.angle) * d.orbitDistance;
        const y = centerY - Math.sin(d.angle) * d.orbitDistance;

        const xHalf = centerX + Math.cos(d.angle + Math.PI) * d.orbitDistance;
        const yHalf = centerY - Math.sin(d.angle + Math.PI) * d.orbitDistance;

        return `M ${x} ${y} A ${d.orbitDistance} ${d.orbitDistance} 0 0 0 ${xHalf} ${yHalf} A ${d.orbitDistance} ${d.orbitDistance} 0 0 0 ${x} ${y}`;
      })
      .attr('dur', (d, i) => d.orbitPeriod + 'ms')
      .attr('repeatCount', 'indefinite')
  })
</script>

<svg 
  id='board'
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1000 1000"
  height="100%"
  width="100%"
  ></svg>