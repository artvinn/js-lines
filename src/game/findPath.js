import R from 'ramda';

export default function findPath(startNode, endNode, grid) {
	const frontier = [startNode];
	const visited = [];
	const goal = endNode;
	let current, neibs, index;

	//if goal is blocked return
	if (!isReachable(startNode, endNode, grid)) {
		return null;
	}

	while (frontier.length > 0) {
		current = minimalCost(frontier);
		index = frontier.indexOf(current);
		frontier.splice(index, 1);

		neibs = grid.getNeighbours(current);
		for (let node of neibs) {
			if (node.walkable && !visited.includes(node)) {
				node.parentNode = current;
				node.G = node.parentNode.G + 1;
				node.H = heuristic(goal, node);
				frontier.push(node);
			}
		}

		visited.push(current);
		//if goal neighbours with current node, construct the path
		if (frontier.includes(goal)) {
			return reconstructPath(goal, current);
		}
	}

	//if there is no path
	return null;
};

function reconstructPath(goal, current) {
	const path = [goal];
	let node = current;

	while (node) {
		path.push(node);
		node = node.parentNode;
	}

	return path;
};

//approximate cost of path from current node to end node
function heuristic(current, end) {	
	const dx = Math.abs(current.x - end.x);
	const dy = Math.abs(current.y - end.y);
	return dx + dy;
};

//get node with minimal score i.e. the one that will make us closer to the end goal
function minimalCost(nodes) {
	const diff = (a, b) => a.score - b.score;
	return R.head(R.sort(diff, nodes));
};

function isReachable(startNode, endNode, grid) {
	const frontier = [startNode];
	const visited = [];
	const goal = endNode;
	let current, neibs, index;

	while (frontier.length > 0) {
		current = frontier.pop();

		neibs = grid.getNeighbours(current);
		for (let node of neibs) {
			if (node.walkable && !visited.includes(node)) {
				frontier.push(node);
			}
		}

		visited.push(current);

		if (frontier.includes(goal)) {
			return true;
		}
	}

	return false;
}