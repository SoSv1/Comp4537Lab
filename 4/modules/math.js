const PI = 3.1416;
  
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

exports = { add, subtract, PI };

exports.area = function (r) {
  return PI * r * r;
}