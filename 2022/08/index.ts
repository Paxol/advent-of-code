// Year 2022 Day 08

let forest: number[][];
let rows: number;
let cols: number;

function treeTallAtLeastUsInRowBefore(row: number, col: number) {
	const tree = forest[row][col];
	return forest[row].filter((otherTree, idx) => idx >= col ? false : otherTree >= tree);
}

function treeTallAtLeastUsInRowAfter(row: number, col: number) {
	const tree = forest[row][col];
	return forest[row].filter((otherTree, idx) => idx <= col ? false : otherTree >= tree);
}

function treeTallAtLeastUsInColBefore(row: number, col: number) {
	const tree = forest[row][col];

	return getCol(col) // Get current col
		.filter((otherTree, idx) => idx >= row ? false : otherTree >= tree);
}

function treeTallAtLeastUsInColAfter(row: number, col: number) {
	const tree = forest[row][col];

	return getCol(col) // Get current col
		.filter((otherTree, idx) => idx <= row ? false : otherTree >= tree);
}

function getCol(col: number) {
	return forest.map(entireRow => entireRow[col]);
}

function calcScenicScore(row: number, col: number) {
	const currentColumn = getCol(col);
	const element = forest[row][col];

	let top = 0, bottom = 0, left = 0, right = 0;

	for (let i = col - 1; i >= 0; i--) {
		left++;

		if (forest[row][i] >= element)
			break;
	}

	for (let i = col + 1; i < cols; i++) {
		right++;

		if (forest[row][i] >= element)
			break;
	}

	for (let i = row - 1; i >= 0; i--) {
		top++;

		if (currentColumn[i] >= element)
			break;
	}

	for (let i = row + 1; i < rows; i++) {
		bottom++;

		if (currentColumn[i] >= element)
			break;
	}

	return left * right * top * bottom;
}

async function parseInput(input: string): Promise<void> {
	const testInput = ["30373", "25512", "65332", "33549", "35390"].join("\n");
	const splittedInput = input.split("\n").filter(s => s.trim() !== "");

	forest = splittedInput.map(s => s.split('').map(Number));
	cols = forest[0].length;
	rows = forest.length;
}

async function phaseOne(): Promise<string | void> {
	let treesNotVisible = 0;

	for (let row = 1; row < rows - 1; row++) {
		for (let col = 1; col < cols - 1; col++) {
			const sameRowBefore = treeTallAtLeastUsInRowBefore(row, col) // same row before
			const sameRowAfter = treeTallAtLeastUsInRowAfter(row, col) // same row after
			const sameColBefore = treeTallAtLeastUsInColBefore(row, col) // same col before
			const sameColAfter = treeTallAtLeastUsInColAfter(row, col) // same col after

			// Check if there are any trees tall at least as us
			if (sameRowBefore.length > 0
				&& sameRowAfter.length > 0
				&& sameColBefore.length > 0
				&& sameColAfter.length > 0)
				treesNotVisible++;
		}
	}

	return (rows * cols - treesNotVisible).toString();
}

async function phaseTwo(): Promise<string | void> {
	let arr: number[] = [];

	for (let row = 1; row < rows - 1; row++) {
		for (let col = 1; col < cols - 1; col++) {
			arr.push(calcScenicScore(row, col));
		}
	}

	return (arr.sort((a, b) => b - a)[0]).toString();
}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
