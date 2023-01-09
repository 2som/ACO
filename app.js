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

  console.log(adjaencyMatrix[0]);
  
  // const bestPath = antColony(adjaencyMatrix, config);
  // fs.writeFileSync(
  //   "paths.json",
  //   JSON.stringify(displayCoordinates(bestPath, cities)),
  //   "utf8"
  // );

  // console.log(`EXECUTION TIME: ${new Date() - start}ms`)
});

const displayCoordinates = (bestPath, cities) => {
  const { path, cost } = bestPath;
  return {
    locations: path.map((p) => {
      const city = cities.find((c) => c.index === p);
      return [city.lat, city.lon];
    }),
    cost,
  };
};
