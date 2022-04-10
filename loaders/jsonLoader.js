export function loadJson(source) {
  return `export default ${JSON.stringify(source)}`;
}
