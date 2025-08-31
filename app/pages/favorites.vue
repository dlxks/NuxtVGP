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
    v-for="launch in favoriteLaunchesData"
    :key="launch.id"
    cols="12"
    sm="6"
    md="4"
    lg="3"
  >
    <v-card class="h-100">
      <v-card-title class="text-h6">
        {{ launch.mission_name }}
      </v-card-title>
      
      <v-card-subtitle>
        {{ formatDate(launch.launch_date_utc) }}
      </v-card-subtitle>
      
      <v-card-text>
        <div class="mb-2">
          <strong>Launch Site:</strong> {{ launch.launch_site?.site_name_long }}
        </div>
        <div class="mb-2">
          <strong>Rocket:</strong> {{ launch.rocket?.rocket_name }}
        </div>
        <div v-if="launch.details" class="text-caption text-truncate">
          {{ truncateText(launch.details, 120) }}
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        <v-btn
          icon
          size="small"
          color="error"
          @click="removeFavorite(launch.id)"
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
  query GetAllLaunches {
    launches {
      id
      mission_name
      launch_date_utc
      launch_success
      details
      launch_site {
        site_name_long
      }
      rocket {
        rocket_name
      }
    }
  }
`

const { data, pending, error } = useAsyncQuery<{
  launches: Array<{
    id: string
    mission_name: string
    launch_date_utc: string
    launch_success: boolean
    details: string
    launch_site: {
      site_name_long: string
    }
    rocket: {
      rocket_name: string
    }
  }>
}>(query)

// Derived data
const favoriteLaunchesData = computed(() => {
  if (!data.value?.launches) return []
  return data.value.launches.filter(launch => favoriteRockets.value.includes(launch.id))
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
