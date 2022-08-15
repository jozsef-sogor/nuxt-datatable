<template lang="pug">
  v-container
    v-row
      v-col(cols)
        DataTable(
          v-if="items.length || (!items.length && !isLoading)"
          :headers="headers"
          :items="items"
          :totalItems="totalItemsLength"
          :isLoading="isLoading"
          @updateTable="fetchData"
        )
        v-progress-circular(
          v-else
          width="2"
          color="rs__primary"
          indeterminate
        ).mx-auto
</template>

<script>
import DataTable from '~/components/DataTable.vue'
import sales from '~/api/sales.js'

export default {
  components: {
    DataTable
  },
  data() {
    return {
      sales,
      items: [],
      totalItemsLength: 0,
      //currentPage: 1,
      isLoading: false,
      headers: [
        { text: 'Name', value: 'user', align: 'start', headerFilter: false },
        { text: 'Email', value: 'email', headerFilter: false },
        { text: 'Gender', value: 'gender', headerFilter: {type: 'select', options: this.findUniqueValues(sales.results, 'gender')} },
        { text: 'Year', value: 'year', headerFilter: {type: 'range', min: 1970, max: 2030} },
        { text: 'Sales', value: 'sales', headerFilter: {type: 'range', min: 1, max: 999999} },
        { text: 'Country', value: 'country', headerFilter: {type: 'select', options: this.findUniqueValues(sales.results, 'country')} },
      ]
    }
  },
  async created() {
    await this.fetchData({})
    //this.items = response.data
    //this.totalItemsLength = response.total
    //this.currentPage = response.currentPage
  },
  methods: {
    async fetchData({page = 1, itemsPerPage = 10, sortBy = '', sortDesc = false, query = '', filters = {}}) {
      //Set loading state to DataTable
      this.isLoading = true
      console.log(arguments)
      //Get queryString from options
      const queryString = new URLSearchParams({
        page: page,
        itemsPerPage: itemsPerPage,
        sortBy: sortBy,
        sortDesc: sortDesc,
        query: query,
        ...filters
      }).toString()
      console.log(queryString)
      //Mock API call
      const response = await this.mockServerCode(`?${queryString}`)
      this.items = response.data
      this.totalItemsLength = response.total
      this.currentPage = response.currentPage

      this.isLoading = false
    },
    async mockServerCode(queryString) {
      //Get params object from query string
      const urlParams = new URLSearchParams(queryString)
      const reqParams = Object.fromEntries(urlParams)
      console.log(reqParams)
      //Set delay
      await this.delay(3000)
      //Create response
      reqParams.query.toLowerCase() //set query to lowercase for filtering

      //If search query is present filter data, else use all of the data
      const filteredResults = !reqParams.query 
        ? await sales.results 
        : await sales.results.filter((result) => 
          result.user.first_name.toLowerCase().includes(reqParams.query) ||
          result.user.last_name.toLowerCase().includes(reqParams.query) ||
          result.email.toLowerCase().includes(reqParams.query)
        )
      //Sort if required
      reqParams.sortBy && filteredResults.sort(this.sortObjectsByValue(reqParams.sortBy, reqParams.sortDesc))

      //Paginate results
      const start = (reqParams.page - 1) * reqParams.itemsPerPage //starting item in array
      const paginatedResults = filteredResults.slice(start, start + parseInt(reqParams.itemsPerPage))
      const totalResultsLength = filteredResults.length
      const currentPage = reqParams.page
      const resultsObj = {
        total: totalResultsLength,
        currentPage: parseInt(currentPage) ,
        data: paginatedResults
      }

      return resultsObj
    },
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    findUniqueValues(array, property) {
      return [...new Set(array.map(item => item[property]))]
    },
    sortObjectsByValue(objValue, sortDesc = false) {
      //const compare = (a, b) => a.localeCompare(b); //Only compares string
      const compare = (a, b) => -(a < b) || +(a > b) //compares strings and numbers
      return (a, b) => sortDesc == 'true' ? compare(b[objValue], a[objValue]) : compare(a[objValue], b[objValue])
    }
  }
}
</script>

<style lang="sass" scoped>
.v-progress-circular
  position: absolute
  top: 50%
  left: 50%
</style>