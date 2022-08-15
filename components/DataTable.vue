<template lang="pug">
  v-data-table(
    item-key="email"
    dense
    :headers="headers"
    :items="items"
    :options.sync="sortOptions"
    :server-items-length="totalItems"
    :loading="isLoading"
    @update:page="updateTable"
    @update:sortBy="updateTable"
    @update:options="updateTable"
  ).elevation-1.mt-10
    <!-- Searchbar input field -->
    template(v-slot:top)
      v-text-field(
        v-model="searchInput"
        label="Search data"
        class="mx-4"
        clear-icon="mdi-close"
        clearable
      )
    <!-- Column filters -->
      template(v-for="singleHeader in headers" v-slot:[`header.${singleHeader.value}`]={ header }) 
        | {{ singleHeader.text }}
        v-menu(v-if="singleHeader.headerFilter" offset-y :close-on-content-click="false")
          template(v-slot:activator="{ on, attrs }")
            v-btn(icon v-bind="attrs" v-on="on")
              v-icon(small :color="true ? 'primary' : ''") mdi-filter
          div(style="background-color: white; width: 280px")
            v-text-field(
              v-model="columnFilters[singleHeader.value]"
              v-if="singleHeader.headerFilter.type === 'search'"
              type="text"
              label="Enter the search term"
              :autofocus="true"
            ).pa-4
            v-autocomplete(
              v-if="singleHeader.headerFilter.type === 'select'"
              v-model="columnFilters[singleHeader.value]"
              :items="singleHeader.headerFilter.options"
              chips
              clearable
              deletable-chips
              dense
              solo
              multiple
            ).ma-2
            v-range-slider(
              v-if="singleHeader.headerFilter.type === 'range'"
              v-model="columnFilters[singleHeader.value]"
              :max="singleHeader.headerFilter.max"
              :min="singleHeader.headerFilter.min"
              :step="singleHeader.headerFilter.step ? singleHeader.headerFilter.step : 1"
              hide-details
            ).align-center.ma-2
              template(v-slot:prepend)
                v-text-field(
                  :value="columnFilters[singleHeader.value][0]"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 60px"
                  @change="$set(columnFilters[singleHeader.value], 0, $event)"
                )
              template(v-slot:append)
                v-text-field(
                  :value="columnFilters[singleHeader.value][1]"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 60px"
                  @change="$set(columnFilters[singleHeader.value], 1, $event)"
                )
            v-btn(
              v-if="singleHeader.headerFilter.type !== 'range'"
              @click="columnFilters[singleHeader.value] = ''"
              small
              text
              color="primary"
            ).ml-2.mb-2 Clear
      <!-- End of column filters -->
</template>

<script>
export default {
  props: ['headers', 'items', 'totalItems', 'isLoading'],
  data() {
    return {
      searchInput: '',
      sortOptions: {},
      columnFilters: {}
    }
  },
  watch: {
    searchInput() {
      this.updateTable()
    },
    columnFilters: {
      handler() {
        console.log(this.columnFilters)
        this.updateTable(true)
      },
      deep: true
    }
  },
  computed: {
    flattenedColumnFilters() {
      return null
    }
  },
  methods: {
    updateTable(resetPage = false) {
      const updatedOptions = {
        page: resetPage ? 1 : this.sortOptions.page,
        itemsPerPage: this.sortOptions.itemsPerPage,
        sortBy: this.sortOptions.sortBy.length ? this.sortOptions.sortBy[0] : '',
        sortDesc: this.sortOptions.sortDesc.length ? this.sortOptions.sortDesc[0] : false,
        query: this.searchInput ? this.searchInput : '',
        filters: this.columnFilters
      }
      this.$emit('updateTable', updatedOptions)
    }
  }
}
</script>

<style lang="sass" scoped>
  .v-data-table
    max-width: 100%
</style>
