import R from 'ramda';

function getDiagonals(array) {
    const bottomToTop = diagonal(array, true);
    const topToBottom = diagonal(array);

    return R.concat(bottomToTop, topToBottom);
}

function diagonal(array, bottomToTop) {
	const Ylength = array.length;
    const Xlength = array[0].length;
    const maxLength = Math.max(Xlength, Ylength);
    const diagonals = [];
    let temp;

    for (let k = 0; k <= 2 * (maxLength - 1); ++k) {
        temp = [];
        for (let y = Ylength - 1; y >= 0; --y) {
            let x = k - (bottomToTop ? Ylength - y : y);
            if (x >= 0 && x < Xlength) {
                temp.push(array[y][x]);
            }
        }

        diagonals.push(temp);
    }

    return diagonals;
};

export {
	getDiagonals
}