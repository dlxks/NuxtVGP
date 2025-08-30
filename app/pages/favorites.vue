<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Favorite Rockets</h1>
        
        <v-alert v-if="favoriteRockets.length === 0" type="info" class="mb-4">
          You haven't added any rockets to your favorites yet.
          <v-btn variant="text" color="primary" :to="{ path: '/launches' }" class="ml-2">
            Browse Launches
          </v-btn>
        </v-alert>

        <v-row v-else>
          <v-col cols="12" class="text-right">
            <v-btn 
              color="error" 
              variant="outlined" 
              @click="clearFavorites"
              class="mb-4"
            >
              <v-icon left>mdi-delete</v-icon>
              Clear All Favorites
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="pending">
      <v-col cols="12">
        <v-progress-circular indeterminate color="primary" />
        <span class="ml-2">Loading rocket details...</span>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error">
          Error loading rocket details: {{ error.message }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Favorites List -->
    <v-row v-else>
      <v-col
        v-for="rocket in favoriteRocketsData"
        :key="rocket.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="h-100">
          <v-card-title class="text-h6">
            {{ rocket.name }}
          </v-card-title>
          
          <v-card-subtitle>
            First flight: {{ formatDate(rocket.first_flight) }}
          </v-card-subtitle>
          
          <v-card-text>
            <div class="mb-2">
              <strong>Description:</strong> {{ truncateText(rocket.description, 120) }}
            </div>
            
            <v-divider class="my-2" />
            
            <div class="mb-1">
              <strong>Height:</strong> {{ rocket.height?.meters }}m
            </div>
            <div class="mb-1">
              <strong>Diameter:</strong> {{ rocket.diameter?.meters }}m
            </div>
            <div class="mb-1">
              <strong>Mass:</strong> {{ rocket.mass?.kg?.toLocaleString() }} kg
            </div>
            <div class="mb-1">
              <strong>Stages:</strong> {{ rocket.stages }}
            </div>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer />
            <v-btn
              icon
              size="small"
              color="error"
              @click="removeFavorite(rocket.id)"
            >
              <v-icon>mdi-heart-broken</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const favoritesStore = useFavorites()

// State
const favoriteRockets = computed(() => favoritesStore.favoriteRockets)

// GraphQL query (adapted to rockets)
const query = gql`
  query GetAllRockets {
    rockets {
      id
      name
      first_flight
      description
      height {
        meters
      }
      diameter {
        meters
      }
      mass {
        kg
      }
      stages
    }
  }
`

const { data, pending, error } = useAsyncQuery<{
  rockets: Array<{
    id: string
    name: string
    first_flight: string
    description: string
    height: { meters: number }
    diameter: { meters: number }
    mass: { kg: number }
    stages: number
  }>
}>(query)

// Derived data
const favoriteRocketsData = computed(() => {
  if (!data.value?.rockets) return []
  return data.value.rockets.filter(rocket => favoriteRockets.value.includes(rocket.id))
})

// Utils
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const truncateText = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : text.substring(0, maxLength) + '...'

// Actions
const removeFavorite = (rocketId: string) => {
  favoritesStore.removeFavorite(rocketId)
}
const clearFavorites = () => {
  favoritesStore.clearFavorites()
}
</script>
