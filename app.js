const readFile = require("./readFile");
const fs = require("fs");
const config = require("./config");
const antColony = require("./ACO");

const { constructDistanceGraph } = require("./matrix");

const cities = [];

readFile("cities.txt", (line) => {
  const [index, name, demand, lat, lon] = line.split(" ");
  cities.push({
    index: parseInt(index),
    name,
    demand: parseInt(demand),
    lat: parseFloat(lat),
    lon: parseFloat(lon),
  });
}).then(() => {
  const start = new Date();
  const adjaencyMatrix = constructDistanceGraph(cities);

  const demandsArray = cities.map((c) => c.demand);

  const bestPath = antColony(adjaencyMatrix, config, demandsArray);

  const pathsPerAnt = [];

  let currentAntPath = [];
  bestPath.path.forEach((city) => {
    if (city === 30) {
      pathsPerAnt.push(currentAntPath);
      currentAntPath = [];
    }
    currentAntPath.push(city);
  });

  console.log(bestPath.path, "PATH")

  fs.writeFileSync(
    "paths.json",
    JSON.stringify(displayCoordinates(pathsPerAnt, bestPath.cost, cities)),
    "utf8"
  );

  console.log(`EXECUTION TIME: ${new Date() - start}ms`)
});

const displayCoordinates = (pathsPerAnt, cost, cities) => {
  const mapped = pathsPerAnt.map((path) => {
    return {
      locations: path.map((p) => {
        const city = cities.find((c) => c.index === p);
        return [city.lat, city.lon];
      }),
    };
  });

  return {
    paths: mapped,
    cost,
  };
};
