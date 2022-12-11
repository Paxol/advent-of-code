// Year 2022 Day 11

enum OperandType {
	OLD,
	NUMBER
}

type Operand = {
	type: OperandType.OLD
} | {
	type: OperandType.NUMBER,
	value: number
}

type Operation = '*' | '+';

type Expression = {
	firstOperand: Operand,
	operation: Operation,
	secondOperand: Operand
}

function parseExpression(operationStr: string): Expression {
	const [a, op, b] = operationStr.split(' ');

	let firstOperand: Operand;
	let secondOperand: Operand;
	let operation: Operation;

	if (a === "old")
		firstOperand = { type: OperandType.OLD };
	else
		firstOperand = { type: OperandType.NUMBER, value: Number(a) };

	if (b === "old")
		secondOperand = { type: OperandType.OLD };
	else
		secondOperand = { type: OperandType.NUMBER, value: Number(b) };

	switch (op) {
		case "*":
			operation = op;
			break;
		case "+":
			operation = op;
			break;

		default:
			throw new Error(`Not implemented operation: ${op}`);
	}

	return { firstOperand, operation, secondOperand };
}

// Part 1
class Monkey {
	items: number[];
	operation: Expression;
	worryDivider: number;
	ifWorryDivisibleThrowTo: number;
	ifWorryNotDivisibleThrowTo: number;

	itemsInspected = 0;

	constructor(
		items: number[],
		operation: Expression,
		worryDivider: number,
		ifWorryDivisibleThrowTo: number,
		ifWorryNotDivisibleThrowTo: number
	) {
		this.items = items
		this.operation = operation
		this.worryDivider = worryDivider
		this.ifWorryDivisibleThrowTo = ifWorryDivisibleThrowTo
		this.ifWorryNotDivisibleThrowTo = ifWorryNotDivisibleThrowTo
	}

	inspectItem(): number { // Returns the new worry value
		const oldWorry = this.items.shift();

		if (!oldWorry) return 0;

		this.itemsInspected++;

		const firstOperand = this.operation.firstOperand;
		const firstOperandValue = firstOperand.type === OperandType.OLD ? oldWorry : firstOperand.value;

		const secondOperand = this.operation.secondOperand;
		const secondOperandValue = secondOperand.type === OperandType.OLD ? oldWorry : secondOperand.value;

		switch (this.operation.operation) {
			case "*":
				return firstOperandValue * secondOperandValue;
			case "+":
				return firstOperandValue + secondOperandValue;
			default:
				throw new Error(`Not implemented operation: ${this.operation.operation}`)
		}
	}

	throwItem(): [number, number] { // [monkey that receives item, item worry]
		const newWorry = Math.floor(this.inspectItem() / 3);

		if (newWorry % this.worryDivider === 0) {
			return [this.ifWorryDivisibleThrowTo, newWorry];
		}

		return [this.ifWorryNotDivisibleThrowTo, newWorry];
	}

	doRound(): [number, number][] { // list of [monkey that receives item, item worry]
		const acc: [number, number][] = [];

		while (this.items.length > 0)
			acc.push(this.throwItem());

		return acc;
	}
}

// Part 2
class MonkeyBigInt {
	items: bigint[];
	operation: Expression;
	worryDivider: bigint;
	ifWorryDivisibleThrowTo: number;
	ifWorryNotDivisibleThrowTo: number;

	itemsInspected = 0;

	constructor(
		items: bigint[],
		operation: Expression,
		worryDivider: bigint,
		ifWorryDivisibleThrowTo: number,
		ifWorryNotDivisibleThrowTo: number
	) {
		this.items = items
		this.operation = operation
		this.worryDivider = worryDivider
		this.ifWorryDivisibleThrowTo = ifWorryDivisibleThrowTo
		this.ifWorryNotDivisibleThrowTo = ifWorryNotDivisibleThrowTo
	}

	inspectItem(): bigint { // Returns the new worry value
		const oldWorry = this.items.shift();

		if (!oldWorry) return 0n;

		this.itemsInspected++;

		const firstOperand = this.operation.firstOperand;
		const firstOperandValue = firstOperand.type === OperandType.OLD ? oldWorry : BigInt(firstOperand.value);

		const secondOperand = this.operation.secondOperand;
		const secondOperandValue = secondOperand.type === OperandType.OLD ? oldWorry : BigInt(secondOperand.value);

		switch (this.operation.operation) {
			case "*":
				return firstOperandValue * secondOperandValue;
			case "+":
				return firstOperandValue + secondOperandValue;
			default:
				throw new Error(`Not implemented operation: ${this.operation.operation}`)
		}
	}

	throwItem(lcm: bigint): [number, bigint] { // [monkey that receives item, item worry]
		const newWorry = this.inspectItem() % lcm;

		if (newWorry % this.worryDivider === 0n) {
			return [this.ifWorryDivisibleThrowTo, newWorry];
		}

		return [this.ifWorryNotDivisibleThrowTo, newWorry];
	}

	doRound(lcm: bigint): [number, bigint][] { // list of [monkey that receives item, item worry]
		const acc: [number, bigint][] = [];

		while (this.items.length > 0)
			acc.push(this.throwItem(lcm));

		return acc;
	}
}

const monkeysRoundOne: Monkey[] = [];
const monkeysRoundTwo: MonkeyBigInt[] = [];

async function parseInput(input: string): Promise<void> {
	const testInput = [
		"Monkey 0:",
		"  Starting items: 79, 98",
		"  Operation: new = old * 19",
		"  Test: divisible by 23",
		"    If true: throw to monkey 2",
		"    If false: throw to monkey 3",
		"",
		"Monkey 1:",
		"  Starting items: 54, 65, 75, 74",
		"  Operation: new = old + 6",
		"  Test: divisible by 19",
		"    If true: throw to monkey 2",
		"    If false: throw to monkey 0",
		"",
		"Monkey 2:",
		"  Starting items: 79, 60, 97",
		"  Operation: new = old * old",
		"  Test: divisible by 13",
		"    If true: throw to monkey 1",
		"    If false: throw to monkey 3",
		"",
		"Monkey 3:",
		"  Starting items: 74",
		"  Operation: new = old + 3",
		"  Test: divisible by 17",
		"    If true: throw to monkey 0",
		"    If false: throw to monkey 1",
	].join("\n")

	const splittedInput = input.split("\n").filter(s => s.trim() !== "");

	for (let i = 0; i < splittedInput.length;) {
		const id = Number(splittedInput[i++].split(' ')[1][0]); // Monkey number

		const items = splittedInput[i++].trim().slice(16) // Skip "Starting items: "
			.split(', ').map(s => Number(s));

		const operationString = splittedInput[i++].trim().slice(17); // Skip "Operation: new = "

		const divisibleBy = Number(splittedInput[i++].split(' ').at(-1));

		const ifTrue = Number(splittedInput[i++].split(' ').at(-1));
		const ifFalse = Number(splittedInput[i++].split(' ').at(-1));

		monkeysRoundOne[id] = new Monkey(items, parseExpression(operationString), divisibleBy, ifTrue, ifFalse);
		monkeysRoundTwo[id] = new MonkeyBigInt(items.map(i => BigInt(i)), parseExpression(operationString), BigInt(divisibleBy), ifTrue, ifFalse);
	}
}

async function phaseOne(): Promise<string | number | void> {
	for (let round = 0; round < 20; round++) {
		for (let i = 0; i < monkeysRoundOne.length; i++) {
			const monkey = monkeysRoundOne[i];

			const results = monkey.doRound();
			for (const [throwTo, itemWorry] of results) {
				monkeysRoundOne[throwTo].items.push(itemWorry);
			}
		}
	}

	const itemsInspected = monkeysRoundOne.map(m => m.itemsInspected).sort((a, b) => b - a);

	const [mostActiveMonkeyInspectedItems, secondMostActiveMonkeyInspectedItems] = itemsInspected;

	return mostActiveMonkeyInspectedItems * secondMostActiveMonkeyInspectedItems;
}

async function phaseTwo(): Promise<string | number | void> {
	const lcm = monkeysRoundTwo.map(m => m.worryDivider).reduce((a, b) => a * BigInt(b), BigInt(1)); // minimo comune multiplo

	for (let round = 0; round < 10000; round++) {
		for (let i = 0; i < monkeysRoundTwo.length; i++) {
			const monkey = monkeysRoundTwo[i];

			const results = monkey.doRound(lcm);
			for (const [throwTo, itemWorry] of results) {
				monkeysRoundTwo[throwTo].items.push(itemWorry);
			}
		}
	}

	const itemsInspected = monkeysRoundTwo.map(m => m.itemsInspected).sort((a, b) => b - a);

	const [mostActiveMonkeyInspectedItems, secondMostActiveMonkeyInspectedItems] = itemsInspected;

	return mostActiveMonkeyInspectedItems * secondMostActiveMonkeyInspectedItems;
}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
