<script lang="ts">
	import  {createBody, type OBody, type PBody } from '../utils/types/Bodies';
	import {  onMount } from 'svelte';
	import { randomisePlanets } from '../utils/maps/base';

  const movements = { p1Left: false, p1Right: false, p2Left: false, p2Right: false }
  let stop = false;
  let p1: PBody;
  let p2: PBody;
  export let time: number;
  export let step: number;
  const centerX = 500;
  const centerY = 500;

  let loser: PBody | null | undefined = undefined

  const playerRadius = 15;
  const cannonSize = 20;

  const gravConst = 40;
  const ejectConst = 0.03;
  const fireConst = 0.04
  const dampConst = 0.00001;

  const createCenteredBody = createBody.bind(null, centerX, centerY)

  let bodies = [createCenteredBody({
      name: 'Core',
      radius: 100,
      startOrbitAngle: 0,
      orbitClockwise: true,
      rotateClockwise: false,
      orbitDistance: 0,
      orbitPeriod: 0,
      rotationPeriod: 10000,
      bulletProg: 0,
    }),
    createCenteredBody({
      name: 'Body1',
      radius: 50,
      startOrbitAngle: 0,
      orbitClockwise: false,
      rotateClockwise: false,
      orbitDistance: 300,
      orbitPeriod: 20000,
      rotationPeriod: 5000,
      bulletProg: 4,
    }),
    createCenteredBody({
      name: 'Body2',
      radius: 50,
      startOrbitAngle: Math.PI,
      orbitClockwise: true,
      rotateClockwise: true,
      orbitDistance: 500,
      orbitPeriod: 15000,
      rotationPeriod: 10000,
      bulletProg: 4,
    }),
    createCenteredBody({
      name: 'Body3',
      radius: 40,
      startOrbitAngle: 2* Math.PI,
      orbitClockwise: true,
      rotateClockwise: true,
      orbitDistance: 390,
      orbitPeriod: 10000,
      rotationPeriod: 8000,
      bulletProg: 4,
    }),
    createCenteredBody({
      name: 'Body4',
      radius: 40,
      startOrbitAngle: Math.PI/2,
      orbitClockwise: true,
      rotateClockwise: true,
      orbitDistance: 400,
      orbitPeriod: 10000,
      rotationPeriod: 5000,
      bulletProg: 5,
    }),
  ]

  //let bodies = randomisePlanets(centerX, centerY, 5);

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

    p1 = {
      id: "p1",
      name: "Player 1",
      vx: 0,
      vy: 0,
      targetAngle: 0,
      originalAngle: 0,
      cannonAngle: Math.PI/2,
      x: 0,
      y: 0,
      radius: playerRadius,
      target: null,
      ignore: null,
      explode: false,
    }
    p2 = {
      id: "p2",
      name: "Player 2",
      vx: 0,
      vy: 0,
      targetAngle: 0,
      originalAngle: 0,
      cannonAngle: Math.PI/2,
      x: 0,
      y: 0,
      radius: playerRadius,
      target: null,
      ignore: null,
      explode: false,
    }
    addPlayer(p1, bodies[0], Math.PI*3/2) 
    addPlayer(p2, bodies[0], Math.PI/2) 
  })

  const cannonMovement = 0.05;
  const cannonEdge = 0.5;

  $: if (!stop) {
    bodies = bodies.map((body) => {
      body.orbitAngle = body.orbitDistance === 0 ? 0 :(time % body.orbitPeriod) / body.orbitPeriod * (body.orbitClockwise ? 2 : -2) * Math.PI + body.startOrbitAngle;
      body.rotationAngle = (time % body.rotationPeriod) / body.rotationPeriod * (body.rotateClockwise ? 2 : -2) * Math.PI;
      body.bulletProg = body.bulletProg + (0.0001 * body.radius);
      return body
    })


    orbiters.forEach((orbiter) => {
      // Apply gravity

      const distance = Math.sqrt(Math.pow(centerX - orbiter.x, 2) + Math.pow(centerY - orbiter.y, 2));
      const angle = Math.atan((centerY - orbiter.y) / -(centerX - orbiter.x)) + (centerX > orbiter.x ? Math.PI : 0)

      // Currently disobeying gravity hahah
      const g = gravConst / 100000
      damp(orbiter, step);
      applyAcceleration(orbiter, Math.cos(angle + Math.PI) * g, -Math.sin(angle + Math.PI) * g, step)
      move(orbiter, step);
      checkCollisions(orbiter)
      return orbiter;
    })
    orbiters = orbiters


    if (movements.p1Left && p1.cannonAngle < Math.PI - cannonEdge) {
      p1.cannonAngle += cannonMovement;
    }
    if (movements.p1Right && p1.cannonAngle > cannonEdge) {
      p1.cannonAngle -= cannonMovement;
    }
    if (movements.p2Left && p2.cannonAngle < Math.PI - cannonEdge) {
      p2.cannonAngle += cannonMovement;
    }
    if (movements.p2Right && p2.cannonAngle > cannonEdge) {
      p2.cannonAngle -= cannonMovement;
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'w':
        eject(p1);
        break;
      case 'a':
        movements.p1Left = true;
        break;
      case 'd':
        movements.p1Right = true;
        break;
      case 's':
        fire(p1);
        break;
      case 'ArrowUp':
        eject(p2);
        break;
      case 'ArrowDown':
        fire(p2);
        break;
      case 'ArrowLeft':
        movements.p2Left = true;
        break;
      case 'ArrowRight':
        movements.p2Right = true;
        break;
    }
  }
  function onKeyUp(e: KeyboardEvent) {
    switch (e.key) {
      case 'a':
        movements.p1Left = false;
        break;
      case 'd':
        movements.p1Right = false;
        break;
      case 'ArrowLeft':
        movements.p2Left = false;
        break;
      case 'ArrowRight':
        movements.p2Right = false;
        break;
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

      player.vx = Math.cos(rotAngle + Math.PI/2) * 2 * b.radius * Math.PI / b.rotationPeriod + (b.orbitPeriod === 0 ? 0 : Math.cos(angle + Math.PI/2) * distance * 2 * Math.PI / b.orbitPeriod)
      player.vy = -Math.sin(rotAngle + Math.PI/2) * 2 * b.radius * Math.PI / b.rotationPeriod - (b.orbitPeriod === 0 ? 0 :Math.sin(angle + Math.PI/2) * distance * 2 * Math.PI / b.orbitPeriod)
      player.ignore = b;

      applyAcceleration(player, Math.cos(rotAngle + player.cannonAngle - Math.PI/2) * ejectConst, -Math.sin(rotAngle + player.cannonAngle - Math.PI/2) * ejectConst, step)
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
    let oCollider: any = null;
    
    orbiters.forEach((orbiter) => {
      if (orbiter === body) return;

      if (doesCollide(body.x, body.y, body.radius, orbiter.x, orbiter.y, orbiter.radius)) {
        oCollider = orbiter;
      }
    });

    if (oCollider !== null) {
      explode(oCollider);
      explode(body);
      if (oCollider.name !== 'bullet' && body.name !== 'bullet') {
        loser = null;
      }
      return;
    }

    let bCollider: any = null;

    bodies.forEach((b) => {
      if (b === body.ignore) return;
      if (doesCollide(body.x, body.y, body.radius, b.x, b.y, b.radius)) {
        bCollider = b;
      }
    });

    if (bCollider !== null) {
      if (!body.explode) {
        stick(body, bCollider);
      } else {
        // Check if exploded with player in range
        bCollider.players.forEach((player: PBody) => {
          const rotAngle = player.targetAngle + bCollider.rotationAngle;
          const px = bCollider.x + Math.cos(rotAngle) * bCollider.radius
          const py = bCollider.y - Math.sin(rotAngle) * bCollider.radius
          if (doesCollide(body.x, body.y, body.radius, px, py, player.radius)) {
            bCollider.players.splice(bCollider.players.indexOf(player), 1)
            loser = player;
          }
        })
        explode(body);
      }
    }
  }

  function doesCollide(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) < r1 + r2;
  }

  function stick(orbiter: PBody, body: OBody) {
    orbiters.splice(orbiters.indexOf(orbiter), 1)
    const angle = Math.atan((orbiter.y - body.y)/-(orbiter.x - body.x)) + (orbiter.x < body.x ? Math.PI : 0);
    orbiter.originalAngle = angle;
    addPlayer(orbiter, body, angle);
  }

  function addPlayer(player: PBody, body: OBody, angle: number) {
    player.targetAngle = (angle - body.rotationAngle) % (2 * Math.PI);
    player.vx = 0
    player.vy = 0;
    player.x = Math.cos(player.targetAngle) * body.radius;
    player.y = -1 * Math.sin(player.targetAngle) * body.radius;
    player.target = body;
    body.players.push(player);
    bodies = bodies
  }

  function fire(player: PBody) {
    const b = player.target;
    if (b === null) return;
    if (b.bulletProg < 1) return;
    b.bulletProg -= 1;

    const rotAngle = player.targetAngle + b.rotationAngle;
    // Calculate new speed
    const distance = Math.sqrt(Math.pow(centerX - player.x, 2) + Math.pow(centerY - player.y, 2));
    const raw = Math.atan((centerY - player.y) / -(centerX - player.x))
    const angle = centerX > player.x ? raw + Math.PI: raw

    const bullet: PBody = {
      id: "bullet",
      name: "bullet",
      x: b.x + Math.cos(rotAngle) * b.radius,
      y: b.y - Math.sin(rotAngle) * b.radius,
      vx: Math.cos(rotAngle + Math.PI/2) * 2 * b.radius * Math.PI / b.rotationPeriod + (b.orbitPeriod === 0 ? 0 : Math.cos(angle + Math.PI/2) * distance * 2 * Math.PI / b.orbitPeriod),
      vy: -Math.sin(rotAngle + Math.PI/2) * 2 * b.radius * Math.PI / b.rotationPeriod - (b.orbitPeriod === 0 ? 0 :Math.sin(angle + Math.PI/2) * distance * 2 * Math.PI / b.orbitPeriod),
      radius: 10,
      target: null,
      targetAngle: 0,
      cannonAngle: 0,
      originalAngle: 0,
      ignore: b,
      explode: true,
    }

    applyAcceleration(bullet, Math.cos(rotAngle + player.cannonAngle - Math.PI / 2) * fireConst, -Math.sin(rotAngle + player.cannonAngle - Math.PI / 2) * fireConst, step)
    orbiters.push(bullet)
    orbiters = orbiters

    setTimeout(() => {
      if (bullet.ignore === b) {
        bullet.ignore = null;
      }
    }, 1000);
  } 

  function explode(orbiter: PBody) {
    orbiters.splice(orbiters.indexOf(orbiter), 1)
    if (!orbiter.explode) {
      loser = orbiter;
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp}/>

{#if loser !== undefined}
  <h1 id="lost">{loser === null ? "You both lose!" : loser.name + " lost!"}</h1>
{/if}

<div id='left'>
  Player 1 (red): wasd
</div>

<div id='right'>
  Player 2 (blue): arrow keys
</div>

<svg 
  id='board'
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1000 1000"
  height="100%"
  width="100%"
  >
  {#each orbiters as orbiter}
    <circle 
      class={orbiter.id}
      cx={orbiter.x}
      cy={orbiter.y}
      r={orbiter.radius} />
  {/each}
  {#each bodies as body}
    <g>
      <g
          transform={`rotate(${body.rotationAngle / Math.PI * -180} ${body.x} ${body.y})`}
      >
        {#each body.players as player}
          <rect 
            class="cannon"
            transform={`rotate(${-player.targetAngle * 180 / Math.PI - player.cannonAngle * 180 / Math.PI} ${body.x + player.x} ${body.y + player.y})`}
            x={body.x + player.x - cannonSize/2}
            y={body.y + player.y - cannonSize/2}
            width={cannonSize}
            height={30}
          ></rect>
          <circle
            class={player.id}
            cx={body.x + player.x}
            cy={body.y + player.y}
            r={player.radius} />
        {/each}
        <circle
          class="body"
          cx={body.x}
          cy={body.y}
          r={body.radius}/>
        <circle
          class="spot"
          cx={body.x + body.radius / 4 * 3}
          cy={body.y}
          r={5}/>

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
    filter: drop-shadow(0 0 1px grey);
  }
  .spot {
    fill: #444 
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