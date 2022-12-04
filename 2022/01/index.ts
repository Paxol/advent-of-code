// Year 2022 Day 01

let calories: number[];

async function parseInput(input: string): Promise<void> {
	calories = input.split("\n\n")
		.map(str => str.split('\n').reduce((a, b) => a + Number(b), 0))
		.sort((a, b) => b - a);
}

async function phaseOne(): Promise<string | void> {
	return calories[0].toString();
}

async function phaseTwo(): Promise<string | void> {
	return (calories[0] + calories[1] + calories[2]).toString();
}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
