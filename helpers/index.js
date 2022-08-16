export function debounce (fn, delay = 300) {
  let timeoutID = null
  return function () {
    clearTimeout(timeoutID)
    let args = arguments
    let self = this
    timeoutID = setTimeout(function () {
      fn.apply(self, args)
    }, delay)
  }
}
export function findUniqueValues(array, property) {
  return [...new Set(array.map(item => item[property]))]
}

export function sortObjectsByValue(objValue, sortDesc = false) {
  //const compare = (a, b) => a.localeCompare(b); //Only compares string
  const compare = (a, b) => -(a < b) || +(a > b) //compares strings and numbers
  return (a, b) => sortDesc == 'true' ? compare(b[objValue], a[objValue]) : compare(a[objValue], b[objValue])
}