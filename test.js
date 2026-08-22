let displayPosition = null;
let queuePosition = 0; // real pos = 1
const realPos = queuePosition + 1;

if (displayPosition === null) {
  if (realPos === 1) {
    displayPosition = Math.floor(Math.random() * 4) + 3;
  } else {
    displayPosition = realPos;
  }
}
console.log(displayPosition);
