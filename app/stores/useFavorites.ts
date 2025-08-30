import { defineStore } from 'pinia'

export const useFavorites = defineStore('favorites', {
  state: () => ({
    favoriteRockets: [] as string[],
  }),
  getters: {
    isFavorite: (state) => {
      return (rocketId: string) => state.favoriteRockets.includes(rocketId)
    },
  },
  actions: {
    addFavorite(rocketId: string) {
      if (!this.favoriteRockets.includes(rocketId)) {
        this.favoriteRockets.push(rocketId)
      }
    },
    removeFavorite(rocketId: string) {
      this.favoriteRockets = this.favoriteRockets.filter(id => id !== rocketId)
    },
    clearFavorites() {
      this.favoriteRockets = []
    },
  },
})
