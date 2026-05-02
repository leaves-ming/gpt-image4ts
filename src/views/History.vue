<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">生成历史</h2>
      <div class="flex gap-2">
        <el-button v-if="selectedIds.length > 0" type="primary" @click="batchDownload" :loading="downloadLoading">
          批量下载 ({{ selectedIds.length }})
        </el-button>
        <el-button type="danger" @click="clearAll" :loading="clearLoading">清空全部</el-button>
      </div>
    </div>

    <div v-if="store.historyList.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="item in store.historyList" :key="item.id" class="group relative bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <el-checkbox v-model="selectedIds" :value="item.id" class="absolute top-2 left-2 z-10 bg-white/80 rounded" />
        <img :src="item.images[0].startsWith('http') ? item.images[0] : `data:image/png;base64,${item.images[0]}`" class="w-full aspect-square object-cover" alt="历史图片" />
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <el-button type="primary" size="small" @click="downloadSingle(item)">下载</el-button>
          <el-button type="danger" size="small" @click="deleteItem(item.id)">删除</el-button>
        </div>
        <div class="p-2 text-xs text-gray-500 dark:text-gray-400 truncate">
          {{ item.prompt.slice(0, 20) }}...
        </div>
      </div>
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow p-20 text-center">
      <div class="text-gray-400 dark:text-gray-500 text-6xl mb-4">📝</div>
      <p class="text-gray-500 dark:text-gray-400">暂无生成历史</p>
    </div>

    <div class="flex justify-center" v-if="store.historyTotal > 20">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="20"
        :total="store.historyTotal"
        @current-change="loadPage"
        layout="prev, pager, next"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/app'
import { downloadSingleImage, downloadImagesAsZip } from '@/utils/download'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useAppStore()
const currentPage = ref(1)
const selectedIds = ref<string[]>([])
const downloadLoading = ref(false)
const clearLoading = ref(false)

const loadPage = async (page: number) => {
  await store.loadHistory(page)
  selectedIds.value = []
}

const downloadSingle = (item: any) => {
  const img = item.images[0]
  const url = img.startsWith('http') ? img : `data:image/png;base64,${img}`
  downloadSingleImage(url, `ai-history-${item.createTime}.png`)
}

const batchDownload = async () => {
  if (selectedIds.value.length === 0) return
  downloadLoading.value = true
  try {
    const images: string[] = []
    selectedIds.value.forEach(id => {
      const item = store.historyList.find(h => h.id === id)
      if (item) {
        item.images.forEach(img => {
          images.push(img.startsWith('http') ? img : `data:image/png;base64,${img}`)
        })
      }
    })
    await downloadImagesAsZip(images, `ai-images-${Date.now()}.zip`)
    ElMessage.success('下载成功')
    selectedIds.value = []
  } catch (e) {
    ElMessage.error('下载失败: ' + (e as Error).message)
  } finally {
    downloadLoading.value = false
  }
}

const deleteItem = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await store.deleteHistory(id)
    ElMessage.success('删除成功')
  } catch {}
}

const clearAll = async () => {
  try {
    await ElMessageBox.confirm('确定要清空全部历史记录吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    })
    clearLoading.value = true
    await store.clearHistory()
    ElMessage.success('清空成功')
    currentPage.value = 1
  } catch {
    clearLoading.value = false
  }
}
</script>
