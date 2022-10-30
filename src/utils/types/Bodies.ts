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
	orbitAngle: number;
	rotationAngle: number;
	x: number;
	y: number;
	players: PBody[];
	bullets: number;
}

export const createBody = function (centerX: number, centerY: number, body: OBodyData): OBody {
	return {
		...body,
		orbitAngle: body.startOrbitAngle,
		rotationAngle: 0,
		players: [],
		get x() {
			return centerX + Math.cos(this.orbitAngle) * this.orbitDistance;
		},
		get y() {
			return centerY - Math.sin(this.orbitAngle) * this.orbitDistance;
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
