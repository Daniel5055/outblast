interface OBodyData {
  name: string
  orbitDistance: number,
  radius: number;
  startOrbitAngle: number;
  orbitPeriod: number;
  orbitClockwise: boolean
  rotationPeriod: number;
  rotateClockwise: boolean
}

export interface OBody extends OBodyData {
  orbitAngle: number;
  rotationAngle: number;
  x: number;
  y: number;
  players: PBody[];
}

export const createBody = function(centerX: number, centerY: number, body: OBodyData): OBody {
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
    }
  }
}


export interface PBody {
  name: string;
  radius: number;
  x: number;
  y: number;
  vy: number;
  vx: number;
  targetAngle: number;
  target: OBody | null;
}
