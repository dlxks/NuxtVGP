<template>
  <v-app>
    <Navbar />
    <v-main>
      <slot />
    </v-main>
    <v-footer app>
      <v-container class="text-caption">
        <div>Built with Nuxt 3, Vuetify 3, Apollo GraphQL, Pinia, TS</div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import Navbar from '~/components/Navbar.vue'
</script>
