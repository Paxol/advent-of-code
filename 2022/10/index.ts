// Year 2022 Day 10

type Instruction = {
	operand: string,
	value: number
}

let program: Instruction[] = [];
let xRegister: number;
let PC: number; // Program Counter

let executedCycles = 0;

let remainingCyclesBeforeNextInstruction = 0;

function getInstructionCycles(i: Instruction): number {
	switch (i.operand) {
		case "noop":
			return 1;
		case "addx":
			return 2;

		default:
			throw Error("Not implemented");
	}
}

function resetCpu() {
	xRegister = 1;
	PC = 0;
}

// --- Part 1 ---
function execute() {
	const i = program[PC++];

	switch (i.operand) {
		case "noop":
			return;
		case "addx":
			xRegister += i.value;
			return;

		default:
			throw Error("Not implemented");
	}
}

function runProgramFor(cycles: number): { remainingCycles: number; terminated: boolean; } {
	let cyclesTogo = cycles;

	let nextInstruction = program[PC];
	let neededCycles = getInstructionCycles(nextInstruction);

	while (cyclesTogo > neededCycles) {
		execute();
		cyclesTogo -= neededCycles;

		if (PC >= program.length)
			return {
				remainingCycles: cyclesTogo,
				terminated: true
			};

		nextInstruction = program[PC];
		neededCycles = getInstructionCycles(nextInstruction);
	}

	return {
		remainingCycles: cyclesTogo,
		terminated: PC >= program.length
	};
}
// --- End part 1 ---

// --- Part 2 ---

function tick() {
	if (remainingCyclesBeforeNextInstruction > 0) {
		executedCycles++;
		remainingCyclesBeforeNextInstruction -= 1;
	}
}

function runCpu(): boolean {
	if (remainingCyclesBeforeNextInstruction === 0) {
		if (PC >= program.length) return true;

		let instruction = program[PC];
		let neededCycles = getInstructionCycles(instruction);

		remainingCyclesBeforeNextInstruction = neededCycles;
	}

	tick();

	if (remainingCyclesBeforeNextInstruction === 0) {
		execute();
	}

	return false;
}

let crt: string[] = [];
function runCrt() {
	const currentPos = crt.length % 40;

	if (Math.abs(currentPos - xRegister) < 2)
		crt.push("#");
	else
		crt.push(".");
}

function printCrt() {
	const screen = crt.slice(0, 40).join('') + "\n" +
	crt.slice(40, 80).join('') + "\n" +
	crt.slice(80, 120).join('') + "\n" +
	crt.slice(120, 160).join('') + "\n" +
	crt.slice(160, 200).join('') + "\n" +
	crt.slice(200).join('');

	console.log(screen);
}

// End part 2 ---

async function parseInput(input: string): Promise<void> {
	const testInput = ["addx 15", "addx -11", "addx 6", "addx -3", "addx 5", "addx -1", "addx -8", "addx 13", "addx 4", "noop", "addx -1", "addx 5", "addx -1", "addx 5", "addx -1", "addx 5", "addx -1", "addx 5", "addx -1", "addx -35", "addx 1", "addx 24", "addx -19", "addx 1", "addx 16", "addx -11", "noop", "noop", "addx 21", "addx -15", "noop", "noop", "addx -3", "addx 9", "addx 1", "addx -3", "addx 8", "addx 1", "addx 5", "noop", "noop", "noop", "noop", "noop", "addx -36", "noop", "addx 1", "addx 7", "noop", "noop", "noop", "addx 2", "addx 6", "noop", "noop", "noop", "noop", "noop", "addx 1", "noop", "noop", "addx 7", "addx 1", "noop", "addx -13", "addx 13", "addx 7", "noop", "addx 1", "addx -33", "noop", "noop", "noop", "addx 2", "noop", "noop", "noop", "addx 8", "noop", "addx -1", "addx 2", "addx 1", "noop", "addx 17", "addx -9", "addx 1", "addx 1", "addx -3", "addx 11", "noop", "noop", "addx 1", "noop", "addx 1", "noop", "noop", "addx -13", "addx -19", "addx 1", "addx 3", "addx 26", "addx -30", "addx 12", "addx -1", "addx 3", "addx 1", "noop", "noop", "noop", "addx -9", "addx 18", "addx 1", "addx 2", "noop", "noop", "addx 9", "noop", "noop", "noop", "addx -1", "addx 2", "addx -37", "addx 1", "addx 3", "noop", "addx 15", "addx -21", "addx 22", "addx -6", "addx 1", "noop", "addx 2", "addx 1", "noop", "addx -10", "noop", "noop", "addx 20", "addx 1", "addx 2", "addx 2", "addx -6", "addx -11", "noop", "noop", "noop"].join("\n")
	const splittedInput = input.split("\n").filter(s => s.trim() !== "");

	program = splittedInput.map(s => ({ operand: s.split(' ')[0], value: Number(s.split(' ')[1] || '0') } as Instruction))
}

async function phaseOne(): Promise<string | void> {
	// Reset PC and X reg
	resetCpu();

	let signalStrength = 0;

	// Compute the first 20 cycles
	let { remainingCycles, terminated } = runProgramFor(20);
	let cycles = 20;

	while (!terminated) { // Run until the end of the program
		// Sample signal strength
		signalStrength += cycles * xRegister;

		// Run next 40 cycles
		({ remainingCycles, terminated } = runProgramFor(40 + remainingCycles));
		cycles += 40;
	}

	return signalStrength.toString();
}

async function phaseTwo(): Promise<string | void> {
	resetCpu();

	let programEnded = false;

	while (!programEnded) {
		runCrt();
		programEnded = runCpu();
	}

	printCrt();

	return "--- See console ---";
}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
