<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <AppHeader />
    <main class="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
