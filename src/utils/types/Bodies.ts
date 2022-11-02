interface OBodyData {
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

export interface OBody extends OBodyData {
	orbitAngle: number | undefined;
	rotationAngle: number;
	x: number;
	y: number;
	players: PBody[];
	readonly bullets: number;
}

export const createBody = function (centerX: number, centerY: number, body: OBodyData): OBody {
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

export interface PBody {
	id: string;
	name: string;
	radius: number;
	x: number;
	y: number;
	vy: number;
	vx: number;
	targetAngle: number;
	originalAngle: number;
	target: OBody | null;
	ignore: OBody | null;
	cannonAngle: number;
	explode: boolean;
}
