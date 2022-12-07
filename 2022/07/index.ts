// Year 2022 Day 07

interface FileOrDir {
	isDir: boolean,
	name: string,
	size: number
}

class TreeNode {
	public key: string;
	public value: FileOrDir;
	public parent: TreeNode | null;
	public children: TreeNode[];

	constructor(key: string, value: FileOrDir, parent: TreeNode | null = null) {
		this.key = key;
		this.value = value;
		this.parent = parent;
		this.children = [];
	}

	get isLeaf() {
		return this.children.length === 0;
	}

	get hasChildren() {
		return !this.isLeaf;
	}
}

class Tree {
	private root: TreeNode;

	constructor(key: string, value: FileOrDir) {
		this.root = new TreeNode(key, value);
	}

	*preOrderTraversal(node = this.root): Iterable<TreeNode> {
		yield node;
		if (node.children.length) {
			for (const child of node.children) {
				yield* this.preOrderTraversal(child);
			}
		}
	}

	*postOrderTraversal(node = this.root): Iterable<TreeNode> {
		if (node.children.length) {
			for (const child of node.children) {
				yield* this.postOrderTraversal(child);
			}
		}
		yield node;
	}

	get rootNode() {
		return this.root;
	}

	insert(parentNodeKey: string, key: string, value: FileOrDir): TreeNode {
		for (const node of this.preOrderTraversal()) {
			if (node.key === parentNodeKey) {
				const createdNode = new TreeNode(key, value, node);
				node.children.push(createdNode);
				return createdNode;
			}
		}

		throw new Error("Parent node not found");
	}

	remove(key: string) {
		for (const node of this.preOrderTraversal()) {
			const filtered = node.children.filter(c => c.key !== key);
			if (filtered.length !== node.children.length) {
				node.children = filtered;
				return true;
			}
		}
		return false;
	}

	find(key: string) {
		for (const node of this.preOrderTraversal()) {
			if (node.key === key) return node;
		}
		throw new Error("Key not found");
	}
}

function calcSize(node: TreeNode): number {
	if (node.value.size != -1) return node.value.size;

	if (node.isLeaf) {
		if (node.value.isDir) {
			node.value.size = 0;
			return 0;
		} else {
			return node.value.size;
		}
	}

	let size = 0;
	for (let i = 0; i < node.children.length; i++) {
		const childNode = node.children[i];

		size += calcSize(childNode);
	}

	node.value.size = size;

	return size;
}

function findSmallDirs(node: TreeNode, threshold: number, set = new Set<TreeNode>()): Set<TreeNode> {
	if (node.value.size < threshold) set.add(node);

	for (let i = 0; i < node.children.length; i++) {
		if (node.children[i].value.isDir)
			for (const dir of findSmallDirs(node.children[i], threshold, set)) {
				set.add(dir);
			}
	}

	return set;
}

function findAllDirs(node: TreeNode, set = new Set<TreeNode>()): Set<TreeNode> {
	for (const dir of node.children.filter(n => n.value.isDir)) {
		findAllDirs(dir, set);
	}

	if (node.value.isDir) set.add(node);

	return set;
}

function populateTree(idx: number, length: number, currentDir: TreeNode) {
	if (idx >= length) return;

	const [first, second, third] = terminalOutput[idx].split(' ');

	if (first === "dir") {
		fs.insert(currentDir.key, `${currentDir.key}/${second}`, {
			isDir: true,
			name: second,
			size: -1
		});
		populateTree(++idx, length, currentDir);
	} else if (first == "$") {
		if (second === "cd" && third === "..")
			populateTree(++idx, length, currentDir.parent!);
		else if (second === "cd") {
			const dir = fs.find(`${currentDir.key}/${third}`);
			populateTree(++idx, length, dir);
		} else if (second === "ls") {
			populateTree(++idx, length, currentDir);
		}
	} else {
		fs.insert(currentDir.key, `${currentDir.key}/${second}`, {
			isDir: false,
			name: second,
			size: Number(first)
		})
		populateTree(++idx, length, currentDir);
	}
}

let terminalOutput: string[];
let fs: Tree;

async function parseInput(input: string): Promise<void> {
	const testInput = [
		"$ cd /",
		"$ ls",
		"dir a",
		"14848514 b.txt",
		"8504156 c.dat",
		"dir d",
		"$ cd a",
		"$ ls",
		"dir e",
		"29116 f",
		"2557 g",
		"62596 h.lst",
		"$ cd e",
		"$ ls",
		"584 i",
		"$ cd ..",
		"$ cd ..",
		"$ cd d",
		"$ ls",
		"4060174 j",
		"8033020 d.log",
		"5626152 d.ext",
		"7214296 k"
	];

	const splittedInput = input.split("\n").filter(s => s.trim() !== "");

	terminalOutput = splittedInput;

	fs = new Tree("/", {
		isDir: true,
		name: "/",
		size: -1
	} as FileOrDir);

	populateTree(2, terminalOutput.length, fs.rootNode);

	calcSize(fs.rootNode);
}

async function phaseOne(): Promise<string | void> {
	const smallDirs = [...findSmallDirs(fs.rootNode, 100_000)];
	return (smallDirs.reduce((acc, val) => acc + val.value.size, 0)).toString();
}

async function phaseTwo(): Promise<string | void> {
	const totalSize = 70_000_000;
	const updateSize = 30_000_000;
	const toFree = updateSize - (totalSize - fs.rootNode.value.size);

	const allDirs = [...findAllDirs(fs.rootNode)];

	const plausible = allDirs.filter(d => d.value.size > toFree).sort((a, b) => a.value.size - b.value.size);
	return (plausible[0].value.size).toString();
}

export default {
	parseInput,
	phaseOne,
	phaseTwo
};
