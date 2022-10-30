interface OBodyData {
  name: string
  orbitDistance: number,
  radius: number;
  angle: number;
  orbitPeriod: number;
  rotationPeriod: number;
}

export interface OBody extends OBodyData {
  x: number;
  y: number;
  move: (time: number) => void;
}

export const createBody = function(centerX: number, centerY: number, body: OBodyData): OBody {
  return {
    ...body,
    move: function(time) {
      this.angle = body.orbitDistance == 0 ? 0 :((time % body.orbitPeriod) / body.orbitPeriod) * 2 * Math.PI;
      this.x = centerX + Math.cos(this.angle) * body.orbitDistance;
      this.y = centerY - Math.sin(this.angle) * body.orbitDistance;
    },
    x: centerX + Math.cos(body.angle) * body.orbitDistance,
    y: centerY - Math.sin(body.angle) * body.orbitDistance,
  }
}


interface PBody {
  radius: number;
  cx: number;
  cy: number;
}