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
    template(v-slot:top)
      v-text-field(
        v-model="search"
        label="Search data"
        class="mx-4"
      )
</template>

<script>
export default {
  props: ['headers', 'items', 'totalItems', 'isLoading', 'currentPage'],
  data() {
    return {
      search: '',
      sortOptions: {}
    }
  },
  methods: {
    updateTable() {
      const updatedOptions = {
        page: this.sortOptions.page,
        itemsPerPage: this.sortOptions.itemsPerPage,
        sortBy: this.sortOptions.sortBy.length ? this.sortOptions.sortBy[0] : null,
        sortDesc: this.sortOptions.sortDesc.length ? this.sortOptions.sortDesc[0] : false
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
