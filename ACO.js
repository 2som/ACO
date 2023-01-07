const fs = require("fs");
const readline = require("readline");

const readFile = async (filename, onReadLine) => {
  const fileStream = fs.createReadStream(filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    onReadLine(line);
  }
};

const cities = [];

readFile("cities.txt", (line) => {
  const [index, name, demand, lat, lon] = line.split(" ");
  if (index < 6) {
    cities.push({
      index: parseInt(index),
      name,
      demand: parseInt(demand),
      lat: parseFloat(lat),
      lon: parseFloat(lon),
    });
  }
}).then(() => {
  const adjaencyMatrix = constructCompleteWeightedGraph(cities);
  console.log(ACO(cities, adjaencyMatrix));
});

const constructCompleteWeightedGraph = (cities) => {
  graph = [];
  cities.forEach((city) => {
    graph[city.index] = [];
    cities.forEach((city2) => {
      graph[city.index][city2.index] = distance(
        city.lat,
        city.lon,
        city2.lat,
        city2.lon
      );
    });
  });

  return graph;
};

const ACO = (cities, citiesAdjaencyMatrix) => {
  const alfa = 3;
  const beta = 2;
  const antsNumber = 5;
  const homeBase = "Kraków";
  const homeBaseIndex = cities.find(({ name }) => name === "Kraków");
  const antsPaths = [];
  const pheromoneMatrix = [];
//   console.log(citiesAdjaencyMatrix)

  for (let index = 0; index <= cities.length - 1; index++) {
    antsPaths.push([])
    while (antsPaths[index].length < cities.length - 1) {
      if (!antsPaths[index].length) {
        antsPaths[index].push(homeBaseIndex);
      }
      const currentPosition = antsPaths[index][antsPaths[index].length - 1];
      const possibleSelection = citiesAdjaencyMatrix[currentPosition.index].filter(v => v !== 0);
      const randomlySelectedCity = randomPick(possibleSelection);
      if (!antsPaths[index].map(c => c.index).includes(randomlySelectedCity)) {
        antsPaths[index].push(cities.find(({ index }) => index === randomlySelectedCity));
      }
    }
  }

  const pathCosts = antsPaths.map(antPath => {
    let cost = 0
    for (let index = 0; index < antPath.length - 1; index++) {
        const city = antPath[index];
        const nextCity = antPath[index + 1]
        cost += citiesAdjaencyMatrix[city.index][nextCity.index];
    }
    return { cities: antPath.map(c => c.index), cost };
  })

  return pathCosts;
};

const randomPick = (array) => Math.floor(Math.random() * array.length);

const distance = (lat1, lon1, lat2, lon2) => {
  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(1));
};
