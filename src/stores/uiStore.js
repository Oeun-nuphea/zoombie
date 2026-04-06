import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    title: 'Zoombie',
    sidebarOpen: false,
  }),
  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
  },
})
