<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">系统设置</h2>
    <el-form ref="formRef" :model="form" label-width="120px" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <el-form-item label="Base URL" prop="baseUrl">
        <el-input v-model="form.baseUrl" placeholder="https://api.openai.com/v1" />
      </el-form-item>
      <el-form-item label="API Key" prop="apiKeys">
        <el-input v-model="apiKeysText" type="textarea" :rows="4" placeholder="每行输入一个API Key，多Key自动轮询" />
      </el-form-item>
      <el-form-item label="模型名称" prop="model">
        <el-input v-model="form.model" placeholder="dall-e-3" />
      </el-form-item>
      <el-form-item label="生成路径" prop="generatePath">
        <el-input v-model="form.generatePath" placeholder="/images/generations" />
      </el-form-item>
      <el-form-item label="编辑路径" prop="editPath">
        <el-input v-model="form.editPath" placeholder="/images/edits" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveSettings" :loading="loading">保存配置</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '@/store/app'
import type { AppSettings } from '@/types'
import { ElMessage } from 'element-plus'

const store = useAppStore()
const loading = ref(false)
const form = ref<AppSettings>({ ...store.settings })
const apiKeysText = ref('')

onMounted(() => {
  form.value = { ...store.settings }
  apiKeysText.value = form.value.apiKeys.join('\n')
})

const saveSettings = async () => {
  loading.value = true
  try {
    form.value.apiKeys = apiKeysText.value.split('\n').filter(key => key.trim())
    await store.saveSettings(form.value)
    ElMessage.success('配置保存成功')
  } catch (e) {
    ElMessage.error('保存失败: ' + (e as Error).message)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = { ...store.settings }
  apiKeysText.value = form.value.apiKeys.join('\n')
}
</script>
