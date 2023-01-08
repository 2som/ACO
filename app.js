const readFile = require("./readFile");
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
  const adjaencyMatrix = constructDistanceGraph(cities);
  antColony(adjaencyMatrix, config);
});
