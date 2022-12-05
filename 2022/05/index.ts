// Year 2022 Day 05

interface Move {
	take: number,
	from: number,
	to: number
}

const stacks: string[][] = [];
const moves: Move[] = [];

async function parseInput(input: string): Promise<void> {
	const testInput = "    [D]     \n[N] [C]     \n[Z] [M] [P] \n 1   2   3  \n\nmove 1 from 2 to 1\nmove 3 from 1 to 3\nmove 2 from 2 to 1\nmove 1 from 1 to 2";

	// Part 1 - Initial stacks
	const lines = input.split('\n');

	// Populate stack array
	for (let i = 0; i < lines[0].length / 4; i++) {
		stacks.push([]);
	}

	let part2RowIndex = 0;
	// Start scanning for stack content
	for (let j = 0; j < lines.length; j++) {
		const line = lines[j];

		if (line.startsWith(" 1")) {
			part2RowIndex = j + 2;
			break;
		}

		for (let k = 0; k < line.length / 4; k++) {
			const letter = line[k * 4 + 1];


			if (letter != " ")
				stacks[k].push(letter);
		}
	}

	// Reverse all stacks
	for (let i = 0; i < stacks.length; i++) {
		stacks[i].reverse();
	}

	// Part 2 - moves
	for (let i = part2RowIndex; i < lines.length; i++) {
		const matches = lines[i].matchAll(/\d+/g);
		if (matches) {
			const matchesArray = [...matches];

			moves.push({
				take: Number(matchesArray[0]),
				from: Number(matchesArray[1]) - 1,
				to: Number(matchesArray[2]) - 1
			} as Move);
		}
	}
}

async function phaseOne(): Promise<string | void> {
	for (let i = 0; i < moves.length; i++) {
		const move = moves[i];

		const taken: string[] = [];
		for (let j = 0; j < move.take; j++) {
			taken.push(stacks[move.from].pop()!);
		}

		for (let j = 0; j < taken.length; j++) {
			const crate = taken[j];
			stacks[move.to].push(crate);
		}
	}

	let top = "";
	for (let j = 0; j < stacks.length; j++) {
		top += stacks[j].at(-1);
	}

	return top;
}

async function phaseTwo(): Promise<string | void> {

}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
