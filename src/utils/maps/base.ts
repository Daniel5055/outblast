import { createBody } from '../types/body';

export function randomisePlanets(centerX: number, centerY: number, count: number) {
	const createCenteredBody = createBody.bind(null, centerX, centerY);
	const bodies = [
		createCenteredBody({
			name: 'Core',
			radius: 50,
			startOrbitAngle: 0,
			orbitClockwise: true,
			rotateClockwise: true,
			orbitDistance: 0,
			orbitPeriod: 0,
			rotationPeriod: 10000,
			bulletProg: 0
		})
	];

	for (let i = 0; i < count; i++) {
		bodies.push(
			createCenteredBody({
				name: 'B' + (i + 1),
				radius: randomFromRange(30, 50),
				startOrbitAngle:
					(randomFromRange(i % 2 === 0 ? 5 : 185, i % 2 === 0 ? 175 : 355) / 180) * Math.PI,
				orbitClockwise: randomFromRange(0, 1) === 1,
				rotateClockwise: randomFromRange(0, 1) === 1,
				orbitDistance: randomFromRange(100 * (i + 1) + 100, 100 * (i + 1) + 110),
				orbitPeriod: randomFromRange(10000, 20000),
				rotationPeriod: randomFromRange(8000, 20000),
				bulletProg: randomFromRange(0, 5)
			})
		);
		console.log(bodies.at(-1)?.orbitDistance);
	}

	console.log(randomFromRange(0, 1), 'random');
	console.log(randomFromRange(0, 1), 'random');
	console.log(randomFromRange(0, 1), 'random');
	console.log(randomFromRange(0, 1), 'random');

	return bodies;
}

function randomFromRange(start: number, end: number) {
	return Math.floor(Math.random() * (end - start + 1)) + start;
}
