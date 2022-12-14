// Year 2022 Day 12

type Location = {
	x: number;
	y: number;
	height: number;
}

function getNeighbor(node: Location) {
	const n = [] as Location[];

	if (node.y > 0) // Top
	{
		const possibleNode = grid[getIndexByCords(node.x, node.y - 1)];

		if (possibleNode.height <= node.height + 1)
			n.push(possibleNode)
	}

	if (node.x > 0) // Left
	{
		const possibleNode = grid[getIndexByCords(node.x - 1, node.y)];

		if (possibleNode.height <= node.height + 1)
			n.push(possibleNode)
	}

	if (node.y < h - 1) // Bottom
	{
		const possibleNode = grid[getIndexByCords(node.x, node.y + 1)];

		if (possibleNode.height <= node.height + 1)
			n.push(possibleNode)
	}

	if (node.x < w - 1) // Right
	{
		const possibleNode = grid[getIndexByCords(node.x + 1, node.y)];

		if (possibleNode.height <= node.height + 1)
			n.push(possibleNode)
	}

	return n;
}

function reconstructPath(cameForm: Location[], current: Location) {
	const path = [current];

	let aaa = cameForm[getIndexByLocation(current)];
	while (aaa) {
		current = aaa;
		path.push(current);
		aaa = cameForm[getIndexByLocation(current)];
	}

	return path.reverse();
}

function aStar(start: Location, end: Location): Location[] | undefined {
	let openSet = [] as Location[];
	openSet.push(start);

	const cameForm = [] as Location[];

	let gScore = grid.map(() => Number.MAX_SAFE_INTEGER);
	gScore[getIndexByLocation(start)] = 0;

	let fScore = grid.map(() => Number.MAX_SAFE_INTEGER);
	fScore[getIndexByLocation(start)] = guessCost(start, end);

	while (openSet.length > 0) {
		let minFIdx = 0;
		for (let i = 1; i < openSet.length; i++) {
			const a = getIndexByLocation(openSet[i]);
			const b = getIndexByLocation(openSet[minFIdx]);

			if (fScore[a] < fScore[b])
				minFIdx = i;
		}

		const [current] = openSet.splice(minFIdx, 1);

		if (current.x === end.x && current.y === end.y)
			return reconstructPath(cameForm, current);

		for (const n of getNeighbor(current)) {
			const tentativeGScore = gScore[getIndexByLocation(current)] + 1;
			if (tentativeGScore < gScore[getIndexByLocation(n)]) {
				const nIdx = getIndexByLocation(n);

				cameForm[nIdx] = current;
				gScore[nIdx] = tentativeGScore;
				fScore[nIdx] = tentativeGScore + guessCost(n, end);

				if (openSet.findIndex(l => l.x === n.x && l.y === n.y) === -1)
					openSet.push(n);
			}
		}
	}

	return undefined;
}

// Trying to optimise a bit by passing a good path to get to the end
function aStarV2(start: Location, knownPath: string[]) {
	let openSet = [] as Location[];
	openSet.push(start);

	const cameForm = [] as Location[];

	let gScore = grid.map(() => Number.MAX_SAFE_INTEGER);
	gScore[getIndexByLocation(start)] = 0;

	let fScore = grid.map(() => Number.MAX_SAFE_INTEGER);
	fScore[getIndexByLocation(start)] = guessCost(start, end);

	while (openSet.length > 0) {
		let minFIdx = 0;
		for (let i = 1; i < openSet.length; i++) {
			const a = getIndexByLocation(openSet[i]);
			const b = getIndexByLocation(openSet[minFIdx]);

			if (fScore[a] < fScore[b])
				minFIdx = i;
		}

		const [current] = openSet.splice(minFIdx, 1);

		if (current.x === end.x && current.y === end.y)
			return reconstructPath(cameForm, current);

		for (const n of getNeighbor(current)) {
			const nIdx = getIndexByLocation(n);
			const knownPathIdx = knownPath.indexOf(`${n.x} ${n.y}`);
			
			// If the current neighbor is present in the known path
			// continue with it
			if (knownPathIdx != -1) {
				cameForm[nIdx] = current;
				const locs = knownPath.splice(knownPathIdx).map(s => {
					const [x, y] = s.split(' ');
					return grid.find(l => (l.x === Number(x) && l.y === Number(y)))!;
				})

				for (let i = 1; i < locs.length; i++) {
					cameForm[getIndexByLocation(locs[i])] = locs[i - 1];
				}

				return reconstructPath(cameForm, locs.at(-1)!);
			}

			const tentativeGScore = gScore[getIndexByLocation(current)] + 1;
			if (tentativeGScore < gScore[nIdx]) {

				cameForm[nIdx] = current;
				gScore[nIdx] = tentativeGScore;
				fScore[nIdx] = tentativeGScore + guessCost(n, end);

				if (openSet.findIndex(l => l.x === n.x && l.y === n.y) === -1)
					openSet.push(n);
			}
		}
	}

	return undefined;
}

function guessCost(location: Location, end: Location) {
	return Math.abs(location.x - end.x) + Math.abs(location.y - end.y);
}

function getIndexByLocation(location: Location) {
	return getIndexByCords(location.x, location.y);
}

function getIndexByCords(x: number, y: number) {
	return y * w + x;
}

let w: number;
let h: number;

let grid: Location[];

let start: Location;
let end: Location;

async function parseInput(input: string): Promise<void> {
	const testInput = [
		"Sabqponm",
		"abcryxxl",
		"accszExk",
		"acctuvwj",
		"abdefghi",
	].join('\n')

	const splittedInput = input.split("\n").filter(s => s.trim() !== "");

	h = splittedInput.length;
	w = splittedInput[0].length;

	grid = splittedInput.flatMap((l, y) => l.split('').map((c, x) => {
		const location = { x, y, height: c.charCodeAt(0) - 97 } as Location;

		if (c === 'S') { // Start\
			location.height = 0;
			start = location;
		} else if (c === 'E') { // End
			location.height = 25
			end = location;
		}

		return location
	}));
}

let firstPath: Location[];

async function phaseOne(): Promise<string | number | void> {
	firstPath = aStar(start, end) ?? [];

	return (firstPath?.length ?? 0) - 1;
}

async function phaseTwo(): Promise<string | number | void> {
	const locationStrings = firstPath.map(l => `${l.x} ${l.y}`);

	const res = grid.filter(l => (l.x !== 0 || l.y !== 0) && l.height === 0);

	let minLen = Number.MAX_SAFE_INTEGER;
	for (let i = 0; i < res.length; i++) {
		const len = aStarV2(res[i], locationStrings)?.length ?? minLen;

		if (len < minLen) minLen = len
	}

	return minLen - 1
}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
