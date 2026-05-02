<template>
  <Layout />
</template>

<script setup lang="ts">
import Layout from '@/components/Layout.vue'
import { useAppStore } from '@/store/app'
import { onMounted } from 'vue'

const store = useAppStore()

onMounted(() => {
  store.init()
})
</script>
