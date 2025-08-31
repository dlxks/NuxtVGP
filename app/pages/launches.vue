
<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 mb-4">SpaceX Launches</h1>
        
        <!-- Filter and Sort Controls -->
        <v-row class="align-center mb-4">
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="selectedYear"
              :items="availableYears"
              label="Filter by Year"
              clearable
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="sortOrder"
              :items="[
                { title: 'Newest First', value: 'desc' },
                { title: 'Oldest First', value: 'asc' }
              ]"
              label="Sort by Date"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Search missions"
              prepend-inner-icon="mdi-magnify"
              density="comfortable"
              clearable
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="pending">
      <v-col cols="12">
        <v-progress-circular indeterminate color="primary" />
        <span class="ml-2">Loading launches...</span>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error">
          Error loading launches: {{ error.message }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Launches List -->
    <v-row v-else>
      <v-col cols="12">
        <v-alert v-if="filteredLaunches.length === 0" type="info">
          No launches found matching your criteria.
        </v-alert>
        
        <v-row>
          <v-col
            v-for="launch in filteredLaunches"
            :key="launch.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card class="h-100" :to="`/rockets/${launch.rocket?.rocket?.id}`">
              <v-card-title class="text-h6">
                {{ launch.mission_name }}
              </v-card-title>
              
              <v-card-subtitle>
                {{ formatDate(launch.launch_date_utc) }}
              </v-card-subtitle>
              
              <v-card-text>
                <div class="mb-2">
                  <strong>Launch Site:</strong> {{ launch.launch_site?.site_name_long || 'Unknown' }}
                </div>
                <div class="mb-2">
                  <strong>Rocket:</strong> {{ launch.rocket?.rocket_name || 'Unknown' }}
                </div>
                <div v-if="launch.details" class="text-caption text-truncate">
                  {{ truncateText(launch.details, 100) }}
                </div>
              </v-card-text>
              
              <v-card-actions>
                <v-chip
                  :color="launch.launch_success === true ? 'success' : launch.launch_success === false ? 'error' : 'warning'"
                  size="small"
                >
                  {{ launch.launch_success === true ? 'Success' : launch.launch_success === false ? 'Failed' : 'Unknown' }}
                </v-chip>
                <v-spacer />
                <v-btn
  icon
  size="small"
  @click="toggleFavorite(launch)"
>
  <v-icon>
    {{ isFavorite(launch) ? 'mdi-heart' : 'mdi-heart-outline' }}
  </v-icon>
</v-btn>

              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const query = gql`
  query GetLaunches {
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
        rocket {
          id
        }
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
      rocket: {
        id: string
      }
    }
  }>
}>(query)

// Filter and sort state
const selectedYear = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('desc')
const searchQuery = ref('')

// Available years for filtering
const availableYears = computed(() => {
  if (!data.value?.launches) return []
  
  const years = data.value.launches
    .map(launch => new Date(launch.launch_date_utc).getFullYear().toString())
    .filter((year, index, self) => self.indexOf(year) === index)
    .sort((a, b) => b.localeCompare(a))
  
  return years
})

// Filtered and sorted launches
const filteredLaunches = computed(() => {
  if (!data.value?.launches) return []

  let launches = [...data.value.launches]

  console.log('Launches data:', launches)  // Log launches data for debugging

  // Filter by year
  if (selectedYear.value) {
    launches = launches.filter(launch => 
      new Date(launch.launch_date_utc).getFullYear().toString() === selectedYear.value
    )
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    launches = launches.filter(launch => 
      launch.mission_name.toLowerCase().includes(query) ||
      (launch.details && launch.details.toLowerCase().includes(query))
    )
  }

  // Sort by date
  launches.sort((a, b) => {
    const dateA = new Date(a.launch_date_utc).getTime()
    const dateB = new Date(b.launch_date_utc).getTime()
    return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA
  })

  return launches
})

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Favorites functionality
// Favorites functionality
const favoritesStore = useFavorites()

const isFavorite = (launch: { id: string }) => {
  return favoritesStore.isFavorite(launch.id)
}

const toggleFavorite = (launch: { id: string }) => {
  if (isFavorite(launch)) {
    favoritesStore.removeFavorite(launch.id)
  } else {
    favoritesStore.addFavorite(launch.id)
  }
}
</script>
