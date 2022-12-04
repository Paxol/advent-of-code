// Year 2022 Day 04

interface Range {
	from: number,
	to: number
}

let assignments: [Range, Range][]

async function parseInput(input: string): Promise<void> {
	const testInput = "2-4,6-8\n2-3,4-5\n5-7,7-9\n2-8,3-7\n6-6,4-6\n2-6,4-8";
	const splittedInput = input.split("\n").filter(s => s.trim() !== "");

	assignments = splittedInput.map(s => {
		const [firstPair, secondPair] = s.split(',');

		return [{
			from: Number(firstPair.split('-')[0]),
			to: Number(firstPair.split('-')[1])
		}, {
			from: Number(secondPair.split('-')[0]),
			to: Number(secondPair.split('-')[1])
		}] as [Range, Range]
	})
}

function isFullyContained(assignment: [Range, Range]): boolean {
	const [first, second] = assignment;

	return first.from <= second.from && first.to >= second.to
		|| second.from <= first.from && second.to >= first.to
}

async function phaseOne(): Promise<string | void> {
	const fullyContainedAssignments = assignments.filter(pair => isFullyContained(pair));

	return fullyContainedAssignments.length.toString();
}

async function phaseTwo(): Promise<string | void> {

}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
