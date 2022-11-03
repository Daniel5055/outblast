import type { Orbiter } from "../types/orbiter";

export function applyAcceleration(orbiter: Orbiter, ax: number, ay: number, step: number) {
	orbiter.vx += ax * step;
	orbiter.vy += ay * step;
}

export function move(orbiter: Orbiter, step: number) {
	orbiter.x += orbiter.vx * step;
	orbiter.y += orbiter.vy * step;
}

export function damp(orbiter: Orbiter, dampingMultiplier: number, step: number) {
	const damp = dampingMultiplier * step;
	if (Math.abs(orbiter.vx) < damp) {
		orbiter.vx = 0;
	} else {
		orbiter.vx += (orbiter.vx > 0 ? -1 : 1) * damp;
	}
	if (Math.abs(orbiter.vy) < damp) {
		orbiter.vy = 0;
	} else {
		orbiter.vy += (orbiter.vy > 0 ? -1 : 1) * damp;
	}
}
