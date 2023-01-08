const { constructPheromoneMatrix, calculateCostOfPath } = require("./matrix");
const { sumArray, getRandomIndex } = require("./utils");

const antColony = (adjaencyMatrix, config) => {
  const {
    initialPheromoneValue,
    alpha,
    beta,
    evaporation,
    iterations,
    randomFactor,
    numberOfAnts,
    startingPoint,
  } = config;

  const pheromoneMatrix = constructPheromoneMatrix(
    adjaencyMatrix,
    initialPheromoneValue
  );

  let bestPath = { cost: Number.MAX_SAFE_INTEGER, path: [] };

  for (let iteration = 0; iteration <= iterations; iteration++) {
    const walkedPaths = antsWalking(
      numberOfAnts,
      adjaencyMatrix,
      pheromoneMatrix,
      startingPoint,
      alpha,
      beta,
      iteration === 0 ? 1 : randomFactor
    );

    const pathWithCosts = walkedPaths.map((path) => ({
      path,
      cost: calculateCostOfPath(path, adjaencyMatrix),
    }));

    const candidate = pathWithCosts.find((p) => p.cost < bestPath.cost);
    if (candidate) {
      bestPath = candidate;
    }

    updatePheromones(pheromoneMatrix, pathWithCosts, evaporation);

    if (iteration % 100 === 0) {
      console.log(`ITERATION: ${iteration} \n`);
      console.log(pathWithCosts.map((p) => p.cost));
    }
  }

  console.log(bestPath, "bestpath");
  console.log(bestPath.path.length === [...new Set([...bestPath.path])].length);
  console.log(bestPath.path.length === adjaencyMatrix.length);
  return bestPath;
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

    while (antsPaths[ant].length !== adjaencyMatrix.length) {
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
  alpha,
  beta,
  randomFactor
) => {
  const selection = possibleDirections.filter(
    ({ index }) => !currentAntPath.includes(index)
  );

  if (Math.random() < randomFactor) {
    return selection[
      getRandomIndex(selection.filter((s) => s.cost !== Number.MAX_VALUE))
    ].index;
  }

  const pickProbability = selection.map(
    ({ cost, index: position, pheromone }) => {
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
  for (let row = 0; row < pheromoneMatrix.length; row++) {
    for (
      let pheromone = 0;
      pheromone < pheromoneMatrix[row].length;
      pheromone++
    ) {
      pheromoneMatrix[row][pheromone] =
        (1 - evaporation) * pheromoneMatrix[row][pheromone];
    }
  }

  antPaths.forEach((road) => {
    const { path, cost } = road;
    const antPheromone = 1 / cost;
    for (let index = 0; index < path.length - 1; index++) {
      const node1 = path[index];
      const node2 = path[index + 1];
      pheromoneMatrix[node1][node2] += antPheromone;
    }
  });
};

module.exports = antColony;
