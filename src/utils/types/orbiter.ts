import type { Body } from './body';

const playerRadius = 15;
const playerCannonWidth = 20;
const playerCannonHeight = 30;

const bulletRadius = 10;

interface OrbiterData {
	id: string;
	name: string;
}

export interface Orbiter extends OrbiterData {
	radius: number;
	x: number;
	y: number;
	vy: number;
	vx: number;
	explode: boolean;
	ignore: Body | null;
}

export interface Bullet extends Orbiter {
	explode: true;
}

export interface Player extends Orbiter {
	target: Body | null;
	targetAngle: number;
	explode: false;
	cannonAngle: number;
	cannonWidth: number;
	cannonHeight: number;
	cannonMovement: -1 | 0 | 1;
}

// Factory functions
export function createPlayer(
	playerData: OrbiterData & { target: Body | null; cannonAngle: number }
): Player {
	return {
		...playerData,
		radius: playerRadius,
		cannonWidth: playerCannonWidth,
		cannonHeight: playerCannonHeight,
		cannonMovement: 0,
		targetAngle: 0,
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		ignore: null,
		explode: false
	};
}

export function createBullet(
	bulletData: OrbiterData & { ignore: Body | null; x: number; y: number; vx: number; vy: number }
) {
	return {
		...bulletData,
		radius: bulletRadius,
		explode: true
	};
}
