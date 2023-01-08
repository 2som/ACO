const constructPheromoneMatrix = (adjanecyMatrix, initialValue = 1) => {
  const pheromoneMatrix = [];
  for (let row = 0; row < adjanecyMatrix.length; row++) {
    pheromoneMatrix[row] = [];
    for (let col = 0; col < adjanecyMatrix[row].length; col++) {
      pheromoneMatrix[row][col] = initialValue;
    }
  }
  return pheromoneMatrix;
};

const constructDistanceGraph = (cities) => {
  const graph = [];
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

const calculateCostOfPath = (path, adjaencyMatrix) => {
    let cost = 0;
    for (let index = 0; index < path.length - 1; index++) {
      const node = path[index];
      const nextNode = path[index + 1];
      cost += adjaencyMatrix[node][nextNode];
    }
    return cost;
  };
  
module.exports = {
  constructPheromoneMatrix,
  constructDistanceGraph,
  calculateCostOfPath
};
