const pickCity = (
  pheromoneMatrix,
  citiesAdjaencyMatrix,
  currentAntPath,
  alfa = 0.5,
  beta = 1.5
) => {
  const currentPosition = currentAntPath[currentAntPath.length - 1];

  const selection = citiesAdjaencyMatrix[currentPosition]
    .map((cost, index) => ({ cost, index }))
    .filter(({ cost, index }) => cost !== 0 && !currentAntPath.includes(index));

  const citiesPickProbability = selection.map(({ cost, index: city }) => {
    if (cost === 0) {
      return 0;
    }
    const pheromoneValue = Math.pow(
      pheromoneMatrix[currentPosition][city],
      alfa
    );

    const costValue = 1 / Math.pow(cost, beta);
    const denominator = citiesAdjaencyMatrix[currentPosition].reduce(
      (acc, curr, index) => {
        if (curr === 0) {
          return acc;
        }
        const denominatorValue =
          Math.pow(pheromoneMatrix[currentPosition][index], alfa) *
          Math.pow(1 / curr, beta);
        return acc + denominatorValue;
      },
      0
    );

    return {
      index: city,
      probability: Math.round(
        ((pheromoneValue * costValue) / denominator) * 100
      ),
    };
  });

  console.log(selection);
  console.log(
    pheromoneMatrix[currentPosition].filter(
      (v, index) => index !== currentPosition
    )
  );

  return citiesPickProbability;

  // return rouletteWheel(citiesPickProbability);
};

const citiesAdjaencyMatrix = [
  [0, 466.6, 421.6, 326.8, 341.1, 407.2],
  [466.6, 0, 45, 506.1, 525.1, 69.9],
  [421.6, 45, 0, 470.7, 490.1, 39.7],
  [326.8, 506.1, 470.7, 0, 20, 485],
  [341.1, 525.1, 490.1, 20, 0, 504.6],
  [407.2, 69.9, 39.7, 485, 504.6, 0],
];

const cities = [
  {
    index: 0,
    name: "Białystok",
    demand: 500,
    lat: 53.132488,
    lon: 23.16884,
  },
  {
    index: 1,
    name: "Bielsko-Biała",
    demand: 50,
    lat: 49.807621,
    lon: 19.05584,
  },
  {
    index: 2,
    name: "Chrzanów",
    demand: 400,
    lat: 50.144138,
    lon: 19.40601,
  },
  {
    index: 3,
    name: "Gdańsk",
    demand: 200,
    lat: 54.352024,
    lon: 18.646639,
  },
  {
    index: 4,
    name: "Gdynia",
    demand: 100,
    lat: 54.51889,
    lon: 18.53054,
  },
  {
    index: 5,
    name: "Kraków",
    demand: 0,
    lat: 50.063860272041886,
    lon: 19.94840110431039,
  },
];

const constructPheromoneMatrix = (adjanecyMatrix) => {
  const pheromoneMatrix = [];
  for (let row = 0; row < adjanecyMatrix.length; row++) {
    pheromoneMatrix[row] = [];
    for (let col = 0; col < adjanecyMatrix[row].length; col++) {
      pheromoneMatrix[row][col] = 1;
    }
  }
  return pheromoneMatrix;
};

const pheromoneMatrix = constructPheromoneMatrix(citiesAdjaencyMatrix)

console.log(pheromoneMatrix)

// console.log(pickCity(pheromoneMatrix, citiesAdjaencyMatrix, [0], 1, 5));
