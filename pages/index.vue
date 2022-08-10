<template lang="pug">
  v-container
    v-row
      v-col(cols)
        DataTable(
          v-if="items.length"
          :headers="headers"
          :items="items"
          :totalItems="totalItemsLength"
          :currentPage="currentPage"
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
      currentPage: 1,
      isLoading: false,
      headers: [
        { text: 'Name', value: 'user', align: 'start' },
        { text: 'Email', value: 'email' },
        { text: 'Gender', value: 'gender' },
        { text: 'Year', value: 'year' },
        { text: 'Sales', value: 'sales' },
        { text: 'Country', value: 'country' },
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
    async fetchData({page = 1, itemsPerPage = 10, sortBy = null, sortDesc = false, query = null}) {
      //Set loading state to DataTable
      this.isLoading = true
      //Get queryString from options
      const queryString = new URLSearchParams({
        page: page,
        itemsPerPage: itemsPerPage,
        sortBy: sortBy,
        sortDesc: sortDesc,
        query: query
      }).toString()
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
      //Set delay
      await this.delay(3000)
      //Create response
      const start = (reqParams.page - 1) * reqParams.itemsPerPage //starting item in array
      const resultsItems = await sales.results.slice(start, start + parseInt(reqParams.itemsPerPage))
      const totalResultsLength = sales.results.length
      //const filteredResults = []
      const currentPage = reqParams.page
      const resultsObj = {
        total: totalResultsLength,
        currentPage: parseInt(currentPage) ,
        data: resultsItems
      }

      return resultsObj
    },
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
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