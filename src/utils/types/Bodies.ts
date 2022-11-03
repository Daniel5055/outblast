interface BodyData {
	name: string;
	orbitDistance: number;
	radius: number;
	startOrbitAngle: number;
	orbitPeriod: number;
	orbitClockwise: boolean;
	rotationPeriod: number;
	rotateClockwise: boolean;
	bulletProg: number;
}

export interface Body extends BodyData {
	orbitAngle: number | undefined;
	rotationAngle: number;
	x: number;
	y: number;
	players: Player[];
	readonly bullets: number;
}

// Body factory
export const createBody = function (centerX: number, centerY: number, body: BodyData): Body {
	return {
		...body,
		x: 0,
		y: 0,
		rotationAngle: 0,
		players: [],
		set orbitAngle(angle: number) {
			this.x = centerX + Math.cos(angle) * this.orbitDistance;
			this.y = centerY - Math.sin(angle) * this.orbitDistance;
		},
		get bullets() {
			return Math.floor(this.bulletProg);
		}
	};
};

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
}

const playerRadius = 15;
const playerCannonWidth = 20;
const playerCannonHeight = 30;

const bulletRadius = 10;

// Factory functions
export function createPlayer(playerData: OrbiterData & { target: Body | null; targetAngle: number; cannonAngle: number }): Player {
	return {
		...playerData,
		radius: playerRadius,
		cannonWidth: playerCannonWidth,
		cannonHeight: playerCannonHeight,
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		ignore: null,
		explode: false,
	}
}

export function createBullet(bulletData: OrbiterData & { ignore: Body | null; x: number; y: number; vx: number; vy: number; }) {
	return {
		...bulletData,
		radius: bulletRadius,
		explode: true,
	}
}
