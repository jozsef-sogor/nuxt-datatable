<template lang="pug">
  v-container
    v-row
      v-col(cols)
        DataTable(
          v-if="items.length || (!items.length && !isLoading)"
          :headers="headers"
          :items="computedItems"
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
import { findUniqueValues, sortObjectsByValue } from '~/helpers'

export default {
  components: {
    DataTable
  },
  data() {
    return {
      sales,
      items: [],
      totalItemsLength: 0,
      isLoading: false,
      headers: [
        { text: 'Name', value: 'user', align: 'start', headerFilter: false },
        { text: 'Email', value: 'email', headerFilter: false },
        { text: 'Gender', value: 'gender', headerFilter: {type: 'select', options: findUniqueValues(sales.results, 'gender')} },
        { text: 'Year', value: 'year', headerFilter: {type: 'range', min: 1970, max: 2030} },
        { text: 'Sales', value: 'sales', headerFilter: {type: 'range', min: 1, max: 999999, step: 10000} },
        { text: 'Country', value: 'country', headerFilter: {type: 'select', options: findUniqueValues(sales.results, 'country')} },
      ]
    }
  },
  computed: {
    computedItems() {
      const flattenedNamedItems = this.items.map(item => {
                                    if(typeof item.user !== 'string') item.user = `${item.user.first_name} ${item.user.last_name}`
                                    return {...item}
                                  })
      return this.items.length
        ? flattenedNamedItems
        : []
    }
  },
  async created() {
    await this.fetchData({})
  },
  methods: {
    async fetchData({page = 1, itemsPerPage = 10, sortBy = '', sortDesc = false, query = '', filters = {}}) {
      //Set loading state to DataTable
      this.isLoading = true

      //Get queryString from options
      const queryString = new URLSearchParams({
        page: page,
        itemsPerPage: itemsPerPage,
        sortBy: sortBy,
        sortDesc: sortDesc,
        query: query,
        ...filters
      }).toString()

      //Mock API call
      const response = await this.mockServerCode(`?${queryString}`)
      this.items = response.data
      this.totalItemsLength = response.total
      this.currentPage = response.currentPage

      this.isLoading = false
    },
    async mockServerCode(queryString) {
      //Values the results can be sorted by
      const filterableValues = ['gender', 'year', 'sales', 'country']

      //Get params object from query string
      const urlParams = new URLSearchParams(queryString)
      const reqParams = Object.fromEntries(urlParams)
      //Set delay
      await this.delay(3000)

      //Create response
      reqParams.query.toLowerCase() //set query to lowercase for filtering

      //If search query is present filter data, else use all of the data
      let filteredResults = !reqParams.query 
        ? await sales.results 
        : await sales.results.filter((result) => 
          result.user.first_name.toLowerCase().includes(reqParams.query) ||
          result.user.last_name.toLowerCase().includes(reqParams.query) ||
          result.email.toLowerCase().includes(reqParams.query)
        )
      
      //Filter if required
      for(let entry of Object.entries(reqParams)) {
        if(!entry[1]) continue //If the value is empty skip iteration
        switch(entry[0]) {
          case 'gender': 
          case 'country':
            const filterValues = entry[1].split(',')
            filteredResults = filteredResults.filter(result => filterValues.includes(result[entry[0]]))
            break
          case 'year': 
          case 'sales':
            const [min, max] = entry[1].split(',')
            filteredResults = filteredResults.filter(result => result[entry[0]] >= min && result[entry[0]] <= max)
            break 
        }
      }

      //Sort if required
      reqParams.sortBy && filteredResults.sort(sortObjectsByValue(reqParams.sortBy, reqParams.sortDesc))

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
  }
}
</script>

<style lang="sass" scoped>
.v-progress-circular
  position: absolute
  top: 50%
  left: 50%
</style>