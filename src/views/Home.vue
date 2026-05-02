<template>
  <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1 space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">提示词</h3>
        <el-input v-model="params.prompt" type="textarea" :rows="4" placeholder="请输入描述你想要生成的图片内容" class="mb-3" />
        <el-input v-model="params.negativePrompt" type="textarea" :rows="2" placeholder="负向提示词，描述你不想要的内容" />
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">图生图</h3>
        <el-upload
          v-model:file-list="uploadedImages"
          list-type="picture-card"
          :auto-upload="false"
          accept="image/*"
          :limit="1"
          class="mb-3"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <p class="text-sm text-gray-500 dark:text-gray-400">上传参考图片将自动切换为图生图模式</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">参数配置</h3>
        <el-form label-width="80px">
          <el-form-item label="尺寸">
            <el-select v-model="size" class="w-full">
              <el-option label="512x512" value="512x512" />
              <el-option label="768x768" value="768x768" />
              <el-option label="1024x1024" value="1024x1024" />
              <el-option label="1024x1792" value="1024x1792" />
              <el-option label="1792x1024" value="1792x1024" />
            </el-select>
          </el-form-item>
          <el-form-item label="数量">
            <el-slider v-model="params.numImages" :min="1" :max="4" :step="1" show-input />
          </el-form-item>
          <el-form-item label="步数">
            <el-slider v-model="params.steps" :min="10" :max="50" :step="1" show-input />
          </el-form-item>
          <el-form-item label="CFG">
            <el-slider v-model="params.cfg" :min="1" :max="20" :step="0.5" show-input />
          </el-form-item>
          <el-form-item label="种子">
            <el-input v-model="params.seed" type="number" placeholder="-1为随机" />
          </el-form-item>
        </el-form>
      </div>

      <el-button type="primary" size="large" class="w-full" :loading="loading" @click="submitGenerate">
        生成图片
      </el-button>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <div v-if="currentResult" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">生成结果</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="(img, index) in currentResult.images" :key="index" class="group relative">
            <img :src="img.startsWith('http') ? img : `data:image/png;base64,${img}`" class="w-full rounded-lg shadow" alt="生成图片" />
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <el-button type="primary" size="small" @click="downloadImage(img, index)">下载</el-button>
            </div>
          </div>
        </div>
        <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
          耗时: {{ currentResult.costTime }}ms | 种子: {{ currentResult.parameters.seed }}
        </div>
      </div>

      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow p-20 text-center">
        <div class="text-gray-400 dark:text-gray-500 text-6xl mb-4">🎨</div>
        <p class="text-gray-500 dark:text-gray-400">输入提示词点击生成按钮开始创作</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAppStore } from '@/store/app'
import { Plus } from '@element-plus/icons-vue'
import { downloadSingleImage } from '@/utils/download'
import { ElMessage } from 'element-plus'
import type { TaskParams } from '@/types'

const store = useAppStore()
const loading = ref(false)
const uploadedImages = ref<UploadFile[]>([])
const currentResult = ref<typeof store.currentTask>(null)
const size = ref('1024x1024')

const params = ref<TaskParams>({
  prompt: '',
  negativePrompt: '',
  width: 1024,
  height: 1024,
  steps: 20,
  cfg: 7,
  sampler: 'Euler a',
  seed: -1,
  numImages: 1
})

watch(size, (val) => {
  const [w, h] = val.split('x').map(Number)
  params.value.width = w
  params.value.height = h
})

watch(() => store.currentTask, (val) => {
  currentResult.value = val
})

const submitGenerate = async () => {
  if (!params.value.prompt.trim()) {
    ElMessage.warning('请输入提示词')
    return
  }
  if (store.settings.apiKeys.length === 0) {
    ElMessage.warning('请先在设置页面配置API Key')
    return
  }
  loading.value = true
  try {
    const taskParams = { ...params.value }
    if (uploadedImages.value.length > 0) {
      taskParams.inputImages = uploadedImages.value.map(f => f.raw!)
    }
    if (taskParams.seed === -1) {
      taskParams.seed = Math.floor(Math.random() * 4294967295)
    }
    await store.submitTask(taskParams)
    ElMessage.success('生成成功')
  } catch (e) {
    ElMessage.error('生成失败: ' + (e as Error).message)
  } finally {
    loading.value = false
  }
}

const downloadImage = (img: string, index: number) => {
  const url = img.startsWith('http') ? img : `data:image/png;base64,${img}`
  downloadSingleImage(url, `ai-image-${Date.now()}-${index + 1}.png`)
}
</script>
