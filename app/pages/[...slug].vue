<template>
  <v-container class="text-center">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card class="pa-6">
          <v-card-title class="text-h4 mb-4">
            Page Not Found
          </v-card-title>
          <v-card-text class="text-body-1 mb-4">
            The page you are looking for does not exist.
          </v-card-text>
          <v-card-text class="text-body-2 text-medium-emphasis">
            Redirecting to the launches page in {{ countdown }} seconds...
          </v-card-text>
          <v-progress-linear
            v-model="progress"
            color="primary"
            height="6"
            class="mb-4"
          />
          <v-btn
            color="primary"
            @click="redirectNow"
          >
            Go to Launches Now
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const countdown = ref(3)
const progress = ref(0)

onMounted(() => {
  const interval = setInterval(() => {
    countdown.value--
    progress.value = ((3 - countdown.value) / 3) * 100

    if (countdown.value <= 0) {
      clearInterval(interval)
      navigateTo('/launches')
    }
  }, 1000)
})

const redirectNow = () => {
  navigateTo('/launches')
}
</script>
