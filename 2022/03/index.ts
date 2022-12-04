// Year 2022 Day 03

let backpacksCompartments: [string, string][];

async function parseInput(input: string): Promise<void> {
	const testInput = "vJrwpWtwJgWrhcsFMMfFFhFp\njqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL\nPmmdzqPrVvPwwTWBwg\nwMqvLMZHhHMvwLHjbvcjnnSBnvTQFn\nttgJtRGJQctTZtZT\nCrZsJsPPZsGzwwsLwLmpwMDw";

	const splittedInput = input.split("\n").filter(s => s.trim() !== "");

	backpacksCompartments = splittedInput.map(s => [s.substring(0, s.length / 2), s.substring(s.length / 2)])
}

function getRepeatingChar(input: [string, string]): string {
	const [first, second] = input;

	for (let i = 0; i < first.length; i++) {
		const idx = second.indexOf(first.charAt(i));
		if (idx !== -1)
			return first.charAt(i);
	}
	return '';
}

function getRepeatingCharInGroup(input: [[string, string], [string, string], [string, string]]): string {
	const [a, b, c] = input;

	const first = a[0] + a[1];
	const second = b[0] + b[1];
	const third = c[0] + c[1];

	for (let i = 0; i < first.length; i++) {
		const idxSecond = second.indexOf(first.charAt(i));
		const idxThird = third.indexOf(first.charAt(i));
		if (idxSecond !== -1 && idxThird !== -1)
			return first.charAt(i);
	}
	return '';
}

function charToPriority(char: string): number {
	const asciiCode = char.charCodeAt(0);

	return asciiCode < 97 ? asciiCode - 38 : asciiCode - 96;
}

async function phaseOne(): Promise<string | void> {
	const repeatingChars = backpacksCompartments.map(compartments => getRepeatingChar(compartments));
	const prioritiesSum = repeatingChars.map(char => charToPriority(char)).reduce((a, b) => a + b, 0);

	return prioritiesSum.toString();
}

async function phaseTwo(): Promise<string | void> {
	const groups: [[string, string], [string, string], [string, string]][] = [];
	for (let i = 0; i < backpacksCompartments.length; i += 3) {
		groups.push([backpacksCompartments[i], backpacksCompartments[i + 1], backpacksCompartments[i + 2]])
	}

	const repeatingChars = groups.map(compartments => getRepeatingCharInGroup(compartments));
	const prioritiesSum = repeatingChars.map(char => charToPriority(char)).reduce((a, b) => a + b, 0);

	return prioritiesSum.toString();
}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
