const { constructPheromoneMatrix, calculateCostOfPath } = require("./matrix");
const { sumArray, getRandomIndex } = require("./utils");

const antColony = (adjaencyMatrix, config, demandsArray) => {
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
    const pathsWithCosts = antsWalking(
      numberOfAnts,
      adjaencyMatrix,
      pheromoneMatrix,
      startingPoint,
      alpha,
      beta,
      iteration === 0 ? 1 : randomFactor,
      demandsArray
    );

    const candidate = pathsWithCosts.find((p) => p.cost < bestPath.cost);
    if (candidate) {
      bestPath = candidate;
    }

    // po skończeniu jednej iteracji feromon wyparowuje na wszystkich połączeniach
    evaporate(pheromoneMatrix, evaporation);
  }

  return bestPath;
};

const antsWalking = (
  antsNumber,
  adjaencyMatrix,
  pheromoneMatrix,
  startingPoint,
  alpha,
  beta,
  randomFactor,
  demandsArray
) => {
  const antsPaths = [];
  for (let ant = 0; ant < antsNumber; ant++) {
    let antPath = [startingPoint];
    let antPathCost = 0;
    let antCapacity = 1000;

    while ([...new Set([...antPath])].length !== adjaencyMatrix.length) { //dopóki mrówka nie odwiedzi wszystkich miast
      const currentAntPosition = antPath[antPath.length - 1];

      const possibleDirections = getAntPossibleDirections(
        currentAntPosition,
        adjaencyMatrix,
        pheromoneMatrix
      );

      // miasto wybrane przez mrówkę
      const pickedCity = pickCity(
        adjaencyMatrix,
        antCapacity,
        demandsArray,
        possibleDirections,
        antPath,
        alpha,
        beta,
        randomFactor
      ); 


      if (pickedCity === null) {
        // jeśli mrówka nie może zaspokoić zapotrzebowania w żadnym z dostępnych miast to wracamy do bazy
        antPath.push(startingPoint);
        antCapacity = 1000;
      } else {
        antPath.push(pickedCity);
        antPathCost = calculateCostOfPath(antPath, adjaencyMatrix);
        antCapacity -= demandsArray[pickedCity];
      }
    }

    antPath.push(startingPoint);
    // po skończeniu trasy przez mrówkę, dodajemy trasę do wszystkich tras ukończonych w jednej iteracji i aktualizujemy feromony na podstawie ścieżki wybranej przez mrówkę
    antsPaths.push({ path: antPath, cost: antPathCost, capacity: antCapacity });
    updatePheromones(pheromoneMatrix, antsPaths[ant]);
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
  adjaencyMatrix,
  antCapacity,
  demandsArray,
  possibleDirections,
  currentAntPath,
  alpha,
  beta,
  randomFactor
) => {
  const selection = possibleDirections.filter(
    ({ index }) =>
      !currentAntPath.includes(index) && demandsArray[index] <= antCapacity
  ); // Odfiltruj miasta w których mrówka już była i miasta w których klienci oczekują więcej towaru niż mrówka obecnie posiada

  if (selection.length === 0) {
    return null;
  }

  if (Math.random() < randomFactor) {
    return selection[
      getRandomIndex(selection.filter((s) => s.cost !== Number.MAX_VALUE))
    ].index;
  }

  // Metaheurystyka wybór mrówki na podstawie wartości fermonu i długości trasy
  const pickProbability = selection.map(
    ({ cost, index: position, pheromone }) => {
      const pheromoneValue = Math.pow(pheromone, alpha);

      const costValue = 1 / Math.pow(cost, beta);

      const distanceToBaseCity = Math.pow(1 / adjaencyMatrix[position][30], 2);

      const denominator = possibleDirections.reduce(
        (acc, { index, cost, pheromone }) => {
          if (cost === 0) {
            return acc;
          }
          const denominatorValue =
            Math.pow(pheromone, alpha) * Math.pow(1 / cost, beta) * Math.pow((1 /adjaencyMatrix[index][30]), 2);
          return acc + denominatorValue;
        },
        0
      );

      return {
        index: position,
        probability: Math.round(
          ((pheromoneValue * costValue * distanceToBaseCity) / denominator) * 100
        ),
      };
    }
  );

  return rouletteWheel(pickProbability); //wybór na podstawie skumulowanego prawdpodobieństwa
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

const evaporate = (pheromoneMatrix, evaporation = 0.01) => {
  for (let row = 0; row < pheromoneMatrix.length; row++) {
    for (let col = 0; col < pheromoneMatrix[row].length; col++) {
      pheromoneMatrix[row][col] = (1 - evaporation) * pheromoneMatrix[row][col];
    }
  }
};

const updatePheromones = (pheromoneMatrix, antPath) => {
  const { path, cost } = antPath;
  const antPheromone = 1 / cost;
  for (let index = 0; index < path.length - 1; index++) {
    const node1 = path[index];
    const node2 = path[index + 1];
    pheromoneMatrix[node1][node2] += antPheromone;
  }
};

module.exports = antColony;

