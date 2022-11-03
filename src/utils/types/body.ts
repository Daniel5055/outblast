import type { Player } from './orbiter';

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
