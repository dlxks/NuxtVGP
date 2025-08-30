<template>
  <v-container>
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

    <!-- Rocket Details -->
    <v-row v-else-if="rocket">
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="mb-4" />
        
        <v-card>
          <v-card-title class="text-h4">
            {{ rocket.name }}
          </v-card-title>
          
          <v-card-subtitle class="text-h6">
            First flight: {{ formatDate(rocket.first_flight) }}
          </v-card-subtitle>
          
          <v-card-text>
            <v-row>
              <v-col cols="12" md="8">
                <div class="mb-4">
                  <p>{{ rocket.description }}</p>
                </div>
                
                <v-divider class="my-4" />
                
                <h3 class="text-h6 mb-3">Technical Specifications</h3>
                
                <v-row>
                  <v-col cols="6" sm="4">
                    <v-card variant="outlined" class="text-center">
                      <v-card-title class="text-h6">Height</v-card-title>
                      <v-card-text>
                        {{ rocket.height?.meters }} m
                        <br>
                        <small class="text-caption">({{ rocket.height?.feet }} ft)</small>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="6" sm="4">
                    <v-card variant="outlined" class="text-center">
                      <v-card-title class="text-h6">Diameter</v-card-title>
                      <v-card-text>
                        {{ rocket.diameter?.meters }} m
                        <br>
                        <small class="text-caption">({{ rocket.diameter?.feet }} ft)</small>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="6" sm="4">
                    <v-card variant="outlined" class="text-center">
                      <v-card-title class="text-h6">Mass</v-card-title>
                      <v-card-text>
                        {{ rocket.mass?.kg?.toLocaleString() }} kg
                        <br>
                        <small class="text-caption">({{ rocket.mass?.lb?.toLocaleString() }} lb)</small>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="6" sm="4">
                    <v-card variant="outlined" class="text-center">
                      <v-card-title class="text-h6">Stages</v-card-title>
                      <v-card-text>
                        {{ rocket.stages }}
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="6" sm="4">
                    <v-card variant="outlined" class="text-center">
                      <v-card-title class="text-h6">Boosters</v-card-title>
                      <v-card-text>
                        {{ rocket.boosters || 0 }}
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="6" sm="4">
                    <v-card variant="outlined" class="text-center">
                      <v-card-title class="text-h6">Cost per Launch</v-card-title>
                      <v-card-text>
                        ${{ rocket.cost_per_launch?.toLocaleString() }}
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                
                <v-divider class="my-4" />
                
                <h3 class="text-h6 mb-3">Success Rate</h3>
                <v-progress-linear
                  :model-value="rocket.success_rate_pct || 0"
                  height="25"
                  color="success"
                  class="mb-2"
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.round(value) }}%</strong>
                  </template>
                </v-progress-linear>
                
                <v-divider class="my-4" />
                
                <h3 class="text-h6 mb-3">Country</h3>
                <v-chip color="primary" size="large">
                  {{ rocket.country }}
                </v-chip>
                
                <v-divider class="my-4" />
                
                <h3 class="text-h6 mb-3">Company</h3>
                <p>{{ rocket.company }}</p>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card variant="outlined" class="text-center">
                  <v-card-title class="text-h6">Quick Actions</v-card-title>
                  <v-card-text>
                    <v-btn
                      block
                      :color="isFavorite ? 'error' : 'primary'"
                      @click="toggleFavorite"
                      class="mb-2"
                    >
                      <v-icon left>
                        {{ isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}
                      </v-icon>
                      {{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
                    </v-btn>
                    
                    <v-btn
                      block
                      variant="outlined"
                      color="secondary"
                      :to="{ path: '/launches' }"
                    >
                      <v-icon left>mdi-rocket-launch</v-icon>
                      View Launches
                    </v-btn>
                  </v-card-text>
                </v-card>
                
                <v-card variant="outlined" class="mt-4">
                  <v-card-title class="text-h6">Rocket Status</v-card-title>
                  <v-card-text>
                    <v-chip
                      :color="rocket.active ? 'success' : 'error'"
                      size="large"
                    >
                      {{ rocket.active ? 'Active' : 'Retired' }}
                    </v-chip>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

const route = useRoute()
const rocketId = computed(() => route.params.id as string)

const query = gql`
  query GetRocket($id: ID!) {
    rocket(id: $id) {
      id
      name
      description
      first_flight
      height {
        meters
        feet
      }
      diameter {
        meters
        feet
      }
      mass {
        kg
        lb
      }
      stages
      boosters
      cost_per_launch
      success_rate_pct
      country
      company
      active
    }
  }
`

interface RocketData {
  rocket: {
    id: string
    name: string
    description: string
    first_flight: string
    height: {
      meters: number
      feet: number
    }
    diameter: {
      meters: number
      feet: number
    }
    mass: {
      kg: number
      lb: number
    }
    stages: number
    boosters: number
    cost_per_launch: number
    success_rate_pct: number
    country: string
    company: string
    active: boolean
  }
}

const variables = ref({
  id: rocketId.value
})

const { data, pending, error } = useAsyncQuery<RocketData>(query, variables)

watch(rocketId, (newId) => {
  variables.value.id = newId
}, { immediate: true })

const rocket = computed(() => data.value?.rocket)

// Breadcrumbs
const breadcrumbs = computed(() => [
  {
    title: 'Home',
    disabled: false,
    to: '/'
  },
  {
    title: 'Launches',
    disabled: false,
    to: '/launches'
  },
  {
    title: rocket.value?.name || 'Rocket Details',
    disabled: true
  }
])

// Favorites functionality
const favoritesStore = useFavorites()
const isFavorite = computed(() => favoritesStore.isFavorite(rocketId.value))

const toggleFavorite = () => {
  if (isFavorite.value) {
    favoritesStore.removeFavorite(rocketId.value)
  } else {
    favoritesStore.addFavorite(rocketId.value)
  }
}

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
