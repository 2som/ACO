const { constructPheromoneMatrix, calculateCostOfPath } = require("./matrix");
const { sumArray, getRandomIndex } = require("./utils");

const antColony = (adjaencyMatrix, config) => {
  const {
    initialPheromoneValue,
    alpha,
    beta,
    evaporation,
    iterations,
    randomFator,
    numberOfAnts,
    startingPoint,
  } = config;

  const pheromoneMatrix = constructPheromoneMatrix(
    adjaencyMatrix,
    initialPheromoneValue
  );

  for (let iteration = 0; iteration <= iterations; iteration++) {
    const walkedPaths = antsWalking(
      numberOfAnts,
      adjaencyMatrix,
      pheromoneMatrix,
      startingPoint,
      alpha,
      beta,
      randomFator
    );

    const pathWithCosts = walkedPaths.map((path) => ({
      path,
      cost: calculateCostOfPath(path, adjaencyMatrix),
    }));

    updatePheromones(pheromoneMatrix, pathWithCosts, evaporation);

    if (iteration % 100 === 0) {
      console.log(`ITERATION: ${iteration} \n`);
      console.log(pathWithCosts.map((p) => p.cost));
    }
  }
};

const antsWalking = (
  antsNumber,
  adjaencyMatrix,
  pheromoneMatrix,
  startingPoint,
  alpha,
  beta,
  randomFactor
) => {
  const antsPaths = [];

  for (let ant = 0; ant < antsNumber; ant++) {
    if (!antsPaths[ant]) {
      antsPaths[ant] = [startingPoint];
    }

    while (antsPaths[ant].length < adjaencyMatrix.length - 1) {
      const currentAntPath = antsPaths[ant];
      const currentAntPosition = currentAntPath[currentAntPath.length - 1];

      const possibleDirections = getAntPossibleDirections(
        currentAntPosition,
        adjaencyMatrix,
        pheromoneMatrix
      );

      const pickedCity = pickCity(
        possibleDirections,
        antsPaths[ant],
        alpha,
        beta,
        randomFactor
      );

      antsPaths[ant].push(pickedCity);
    }
  }

  return antsPaths;
};

const getAntPossibleDirections = (
  antPosition,
  adjaencyMatrix,
  pheromoneMatrix
) =>
  adjaencyMatrix[antPosition].map((cost, index) => ({
    cost,
    index,
    pheromone: pheromoneMatrix[antPosition][index],
  }));


const pickCity = (
  possibleDirections,
  currentAntPath,
  alpha = 0.5,
  beta = 1.5,
  randomFactor = 0.15
) => {
  const selection = possibleDirections.filter(
    ({ cost, index }) => cost !== 0 && !currentAntPath.includes(index)
  );

  if (Math.random() <= randomFactor) {
    return getRandomIndex(selection);
  }

  const pickProbability = selection.map(
    ({ cost, index: position, pheromone }) => {
      if (cost === 0) {
        return 0;
      }
      const pheromoneValue = Math.pow(pheromone, alpha);

      const costValue = 1 / Math.pow(cost, beta);

      const denominator = possibleDirections.reduce(
        (acc, { cost, pheromone }) => {
          if (cost === 0) {
            return acc;
          }
          const denominatorValue =
            Math.pow(pheromone, alpha) * Math.pow(1 / cost, beta);
          return acc + denominatorValue;
        },
        0
      );

      return {
        index: position,
        probability: Math.round(
          ((pheromoneValue * costValue) / denominator) * 100
        ),
      };
    }
  );

  return rouletteWheel(pickProbability);
};

const rouletteWheel = (probabilityArray) => {
  const sortedProbabilityArray = probabilityArray.sort(
    (a, b) => b.probability - a.probability
  );

  const cumulativeProbability = sortedProbabilityArray.map(
    ({ index }, position) => {
      return {
        index,
        probability: sumArray(
          sortedProbabilityArray.slice(position).map((pick) => pick.probability)
        ),
      };
    }
  );

  const max = cumulativeProbability[0].probability;
  const randomValue = Math.floor(Math.random() * max);
  for (let index = 0; index < cumulativeProbability.length; index++) {
    const probability = cumulativeProbability[index].probability;
    if (cumulativeProbability[index + 1]) {
      const nextStepProbability = cumulativeProbability[index + 1].probability;
      if (probability <= randomValue && randomValue > nextStepProbability) {
        return cumulativeProbability[index].index;
      }
    }
    return cumulativeProbability[index].index;
  }
};

const updatePheromones = (pheromoneMatrix, antPaths, evaporation = 0.9) => {
  antPaths.forEach((road) => {
    const { path, cost } = road;
    const antPheromone = 1 / cost;
    for (let index = 0; index < path.length - 1; index++) {
      const node1 = path[index];
      const node2 = path[index + 1];
      pheromoneMatrix[node1][node2] =
        pheromoneMatrix[node1][node2] * evaporation + antPheromone;
    }
  });
};

module.exports = antColony;
