<script lang="ts">
	import  {createBody, type OBody, type PBody } from '../utils/types/Bodies';
	import {  onMount } from 'svelte';

  let stop = false;
  export let time: number;
  export let step: number;
  const centerX = 500;
  const centerY = 500;

  const gravConst = 40;
  const ejectConst = 0.01;
  const dampConst = 0.00001;

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
      name: 'Body1',
      radius: 50,
      startOrbitAngle: 0,
      orbitClockwise: true,
      rotateClockwise: true,
      orbitDistance: 300,
      orbitPeriod: 5000,
      rotationPeriod: 3000,
    }),
    createCenteredBody({
      name: 'Body2',
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
    addPlayer({
      name: "Daniel",
      vx: 0,
      vy: 0,
      targetAngle: 0,
      x: 0,
      y: 0,
      radius: 15,
      target: null,
      ignore: null,
    }, b, 0)

  })

  $: if (!stop) {
    bodies = bodies.map((body) => {
      body.orbitAngle = body.orbitDistance === 0 ? 0 :(time % body.orbitPeriod) / body.orbitPeriod * (body.orbitClockwise ? 2 : -2) * Math.PI;
      body.rotationAngle = (time % body.rotationPeriod) / body.rotationPeriod * (body.rotateClockwise ? 2 : -2) * Math.PI;
      return body
    })

    orbiters = orbiters.map((orbiter) => {
      // Apply gravity

      const distance = Math.sqrt(Math.pow(centerX - orbiter.x, 2) + Math.pow(centerY - orbiter.y, 2));
      const angle = Math.atan((centerY - orbiter.y) / -(centerX - orbiter.x)) + (centerX > orbiter.x ? Math.PI : 0)

      const g = gravConst / Math.pow(distance, 2)
      damp(orbiter, step);
      applyAcceleration(orbiter, Math.cos(angle + Math.PI) * g, -Math.sin(angle + Math.PI) * g, step)
      move(orbiter, step);
      checkCollisions(orbiter)
      return orbiter;
    })
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'w') {
      eject(bodies[1].players[0])
    }
  
  }
  function eject(player: PBody) {
    if (player.target !== null) {
      const b = player.target
      player.target = null;

      b.players.splice(b.players.indexOf(player), 1);

      const rotAngle = player.targetAngle + b.rotationAngle;
      // Calculated new player position
      player.x = b.x + Math.cos(rotAngle) * b.radius
      player.y = b.y - Math.sin(rotAngle) * b.radius

      // Calculate new speed
      const distance = Math.sqrt(Math.pow(centerX - player.x, 2) + Math.pow(centerY - player.y, 2));
      const raw = Math.atan((centerY - player.y) / -(centerX - player.x))
      const angle = centerX > player.x ? raw + Math.PI: raw

      player.vx = Math.cos(rotAngle + Math.PI/2) * 2 * b.radius * Math.PI / b.rotationPeriod + Math.cos(angle + Math.PI/2) * distance * 2 * Math.PI / b.orbitPeriod
      player.vy = -Math.sin(rotAngle + Math.PI/2) * 2 * b.radius * Math.PI / b.rotationPeriod - Math.sin(angle + Math.PI/2) * distance * 2 * Math.PI / b.orbitPeriod
      player.ignore = b;

      applyAcceleration(player, Math.cos(rotAngle) * ejectConst, -Math.sin(rotAngle) * ejectConst, step)
      orbiters.push(player)
      orbiters = orbiters

      setTimeout(() => {
        if (player.target === null && player.ignore === b) {
          player.ignore = null;
        }
      }, 1000);
    }
  }

  function applyAcceleration(body: PBody, ax: number, ay: number, step: number) {
    body.vx += ax * step
    body.vy += ay * step
  }

  function move(body: PBody, step: number) {
    body.x += body.vx * step
    body.y += body.vy * step
  }

  function damp(body: PBody, step: number) {
    const damp = dampConst * step
    if (Math.abs(body.vx) < damp) {
      body.vx = 0;
    } else {
      body.vx += (body.vx > 0 ? -1 : 1) * damp
    }
    if (Math.abs(body.vy) < damp) {
      body.vy = 0;
    } else {
      body.vy += (body.vy > 0 ? -1 : 1) * damp
    }
  }
  function checkCollisions(body: PBody) {
    // Yucky code
    let collider = null;
    
    orbiters.forEach((orbiter) => {
      if (orbiter === body) return;

      if (doesCollide(body.x, body.y, body.radius, orbiter.x, orbiter.y, orbiter.radius)) {
        collider = orbiter;
      }
    });

    if (collider !== null) { console.log('Bang!'); return }

    bodies.forEach((b) => {
      if (b === body.ignore) return;
      if (doesCollide(body.x, body.y, body.radius, b.x, b.y, b.radius)) {
        collider = b;
      }
    }, null);

    if (collider !== null) {
      console.log('Boom!', collider.name)
      stick(body, collider)
    }
  }

  function doesCollide(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) < r1 + r2;
  }

  function stick(orbiter: PBody, body: OBody) {
    orbiters.splice(orbiters.indexOf(orbiter), 1)
    const angle = Math.atan((orbiter.y - body.y)/-(orbiter.x - body.x)) + orbiter.x < body.x ? Math.PI : 0;
    addPlayer(orbiter, body, angle);
    stop =true;

  }

  function addPlayer(player: PBody, body: OBody, angle: number) {
    player.targetAngle = (angle - body.rotationAngle) % (2 * Math.PI);
    player.vx = 0
    player.vy = 0;
    player.x = Math.cos(angle) * body.radius;
    player.y = -1 * Math.sin(angle) * body.radius;
    player.target = body;
    body.players.push(player);
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
        transform={`rotate(${body.rotationAngle / Math.PI * -180} ${body.x} ${body.y})`}
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