<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 font-body">
    <header class="sticky top-4 z-50 mx-4">
      <div class="max-w-7xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-bold font-heading text-slate-900 dark:text-white">AI绘画工具</h1>
        </div>
        <nav class="hidden md:flex items-center gap-8">
          <router-link to="/" class="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            生图
          </router-link>
          <router-link to="/history" class="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            历史
          </router-link>
          <router-link to="/settings" class="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            设置
          </router-link>
        </nav>
        <div class="flex items-center gap-4">
          <el-button @click="toggleTheme" :icon="isDark ? Sunny : Moon" circle />
          <el-dropdown class="md:hidden">
            <template #default>
              <el-button :icon="Menu" circle />
            </template>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/')">生图</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/history')">历史</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/settings')">设置</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 py-8 mt-4">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sunny, Moon, Menu } from '@element-plus/icons-vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  isDark.value = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }
})
</script>
