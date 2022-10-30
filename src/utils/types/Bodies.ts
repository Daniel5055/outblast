
export interface OBody {
  name: string
  orbitDistance: number,
  radius: number;
  angle: number;
  orbitPeriod: number;
  rotationPeriod: number;
}

interface PBody {
  radius: number;
  cx: number;
  cy: number;
}