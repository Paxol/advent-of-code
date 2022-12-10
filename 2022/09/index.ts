// Year 2022 Day 09

type Direction = 'L' | 'R' | 'U' | 'D';

type Movement = {
	direction: Direction,
	amount: number,
}

type Position = {
	x: number,
	y: number
}

let moves: Movement[];

// --- Part 1 ---
const head = { x: 0, y: 0 } as Position;
const tail = { x: 0, y: 0 } as Position;

function tailAdjacentHead(): boolean {
	return Math.abs(tail.y - head.y) <= 1 && Math.abs(tail.x - head.x) <= 1;
}

function moveHead(dir: Direction): Position {
	const prevX = head.x;
	const prevY = head.y;

	if (dir === "U") head.y = prevY + 1;
	else if (dir === "D") head.y = prevY - 1;
	else if (dir === "R") head.x = prevX + 1;
	else if (dir === "L") head.x = prevX - 1;

	return { x: prevX, y: prevY };
}
// --- End ---

// --- Part 2 ---
const rope: Position[] = [];

function moveHead2(dir: Direction): Position {
	const prevX = rope[0].x;
	const prevY = rope[0].y;

	if (dir === "U") rope[0].y = prevY + 1;
	else if (dir === "D") rope[0].y = prevY - 1;
	else if (dir === "R") rope[0].x = prevX + 1;
	else if (dir === "L") rope[0].x = prevX - 1;

	return { x: prevX, y: prevY };
}

function adjacentToNext(idx = 0): boolean {
	return Math.abs(rope[idx + 1].y - rope[idx].y) <= 1 && Math.abs(rope[idx + 1].x - rope[idx].x) <= 1;
}
// --- End ---

async function parseInput(input: string): Promise<void> {
	const testInput = ["R 4", "U 4", "L 3", "D 1", "R 4", "D 1", "L 5", "R 2",].join('\n')
	const test2Input = ["R 5", "U 8", "L 8", "D 3", "R 17", "D 10", "L 25", "U 20",].join('\n');

	const splittedInput = input.split("\n").filter(s => s.trim() !== "");

	moves = splittedInput.map(s => ({
		direction: s.split(' ')[0],
		amount: Number(s.split(' ')[1])
	} as Movement));

	for (let i = 0; i < 10; i++) {
		rope.push({ x: 0, y: 0 });
	}
}

async function phaseOne(): Promise<string | void> {
	const visitedByTail = new Set<string>(["0,0"]);

	for (let i = 0; i < moves.length; i++) {
		const m = moves[i];

		for (let j = 0; j < m.amount; j++) {
			// Move head
			const previousHeadPos = moveHead(m.direction);

			// Check if tail should move
			if (!tailAdjacentHead()) {
				// Move tail to previousHeadPos
				tail.x = previousHeadPos.x;
				tail.y = previousHeadPos.y;

				// Save visited pos
				visitedByTail.add(`${tail.x},${tail.y}`);
			}
		}
	}

	return (visitedByTail.size).toString();
}

async function phaseTwo(): Promise<string | void> {
	const visitedByTail = new Set<string>(["0,0"]);

	for (let i = 0; i < moves.length; i++) {
		const m = moves[i];

		for (let j = 0; j < m.amount; j++) {
			// Move head
			moveHead2(m.direction);

			// Check if body should move
			for (let k = 1; k < rope.length; k++) {
				if (!adjacentToNext(k - 1)) {
					const dx = rope[k - 1].x - rope[k].x;
					const dy = rope[k - 1].y - rope[k].y;

					if (dx > 0) rope[k].x++;
					else if (dx < 0) rope[k].x--;

					if (dy > 0) rope[k].y++;
					else if (dy < 0) rope[k].y--;
				}
				else 
					break; // We can ignore other parts, they are surly adjacent
			}

			// Save visited pos
			visitedByTail.add(`${rope.at(-1)!.x},${rope.at(-1)!.y}`);
		}
	}

	return (visitedByTail.size).toString();
}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
