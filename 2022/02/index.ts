// Year 2022 Day 02

enum Move {
	ROCK,
	PAPER,
	SCISSORS
}

enum Outcome {
	LOSE,
	DRAW,
	WIN
}

interface IStrategy {
	move: Move,
	outcome: Outcome
}

let one_rounds: Move[][]
let two_strategy: IStrategy[]

function parseMove(moveStr: string): Move {
	switch (moveStr) {
		case "A":
		case "X":
			return Move.ROCK;
		case "B":
		case "Y":
			return Move.PAPER;
		case "C":
		case "Z":
		default:
			return Move.SCISSORS;
	}
}

function getPointsFromResult(moves: Move[]): number {
	switch (moves[0]) {
		case Move.ROCK:
			if (moves[1] === Move.ROCK) return 3;
			if (moves[1] === Move.PAPER) return 6;
			if (moves[1] === Move.SCISSORS) return 0;
			break;

		case Move.PAPER:
			if (moves[1] === Move.ROCK) return 0;
			if (moves[1] === Move.PAPER) return 3;
			if (moves[1] === Move.SCISSORS) return 6;
			break;

		case Move.SCISSORS:
			if (moves[1] === Move.ROCK) return 6;
			if (moves[1] === Move.PAPER) return 0;
			if (moves[1] === Move.SCISSORS) return 3;
			break;
	}

	return 0;
}

function getPointsFromMove(move: Move): number {
	switch (move) {
		case Move.ROCK:
			return 1;

		case Move.PAPER:
			return 2;

		case Move.SCISSORS:
			return 3
	}
}

function parseOutcome(outcomeStr: string): Outcome {
	switch (outcomeStr) {
		case 'X':
			return Outcome.LOSE;
		case 'Y':
			return Outcome.DRAW;
		case 'Z':
		default:
			return Outcome.WIN;
	}
}

function calculateMyMove(strategy: IStrategy): Move {
	const { move: otherMove, outcome } = strategy;
	if (outcome === Outcome.DRAW) return otherMove;

	switch (otherMove) {
		case Move.ROCK:
			return (outcome === Outcome.WIN) ? Move.PAPER : Move.SCISSORS;

		case Move.PAPER:
			return (outcome === Outcome.WIN) ? Move.SCISSORS : Move.ROCK;

		case Move.SCISSORS:
		default:
			return (outcome === Outcome.WIN) ? Move.ROCK : Move.PAPER;
	}
}

async function parseInput(input: string): Promise<void> {
	const splittedInput = input.split('\n').filter(s => s.trim() !== "")

	one_rounds = splittedInput.map(l => {
		const [otherMoveStr, myMoveStr] = l.split(' ');
		return [parseMove(otherMoveStr), parseMove(myMoveStr)];
	});

	two_strategy = splittedInput.map(l => {
		const [moveStr, outcomeStr] = l.split(' ');
		return {
			move: parseMove(moveStr),
			outcome: parseOutcome(outcomeStr)
		};
	})
}

async function phaseOne(): Promise<string | void> {
	const totalPoints = one_rounds.reduce((points, currentMove) => {
		return points + getPointsFromResult(currentMove) + getPointsFromMove(currentMove[1])
	}, 0);

	return totalPoints.toString();
}

async function phaseTwo(): Promise<string | void> {
	const totalPoints = two_strategy.reduce((points, currentStrategy) => {
		const myMove = calculateMyMove(currentStrategy)
		return points + getPointsFromResult([currentStrategy.move, myMove]) + getPointsFromMove(myMove)
	}, 0);

	return totalPoints.toString();
}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
