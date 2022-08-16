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