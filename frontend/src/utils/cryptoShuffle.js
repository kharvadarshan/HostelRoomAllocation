export function cryptoShuffle(array) {
  const shuffled = [...array];
  const randomArray = new Uint32Array(shuffled.length);
  crypto.getRandomValues(randomArray);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomArray[i] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}