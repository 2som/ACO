const sumArray = (array) => array.reduce((a, b) => a + b, 0);

const getRandomIndex = (array) => Math.floor(Math.random() * array.length);

module.exports = {
  sumArray,
  getRandomIndex,
};
