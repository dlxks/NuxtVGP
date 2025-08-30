<template>
  <v-app-bar flat>
    <v-container>
      <v-row align="center" no-gutters>
        <v-col cols="auto" class="text-h6 font-weight-bold">SpaceX Explorer</v-col>
        <v-spacer />
        <v-btn variant="text" :to="{ path: '/' }">Home</v-btn>
        <v-btn variant="text" :to="{ path: '/launches' }">Launches</v-btn>
        <v-btn variant="text" :to="{ path: '/favorites' }">Favorites</v-btn>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
</script>
 