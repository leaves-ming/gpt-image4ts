import { defineStore } from 'pinia'
import type { AppSettings, TaskParams, GenerateResult } from '@/types'
import { localStorageService } from '@/storage'
import { imageApiClient } from '@/api'

export const useAppStore = defineStore('app', {
  state: () => ({
    settings: {} as AppSettings,
    currentTask: null as GenerateResult | null,
    historyList: [] as GenerateResult[],
    historyTotal: 0,
    loading: false,
    error: ''
  }),

  actions: {
    async init() {
      const savedSettings = await localStorageService.getSettings()
      this.settings = {
        baseUrl: 'https://api.openai.com/v1',
        apiKeys: [],
        model: 'dall-e-3',
        generatePath: '/images/generations',
        editPath: '/images/edits',
        defaultParams: {
          width: 1024,
          height: 1024,
          steps: 20,
          cfg: 7,
          sampler: 'Euler a',
          seed: -1,
          numImages: 1
        },
        ...savedSettings
      }
      await this.loadHistory(1)
    },

    async saveSettings(settings: AppSettings) {
      this.settings = settings
      await localStorageService.saveSettings(settings)
    },

    async submitTask(params: TaskParams) {
      if (!this.settings.apiKeys.length) {
        throw new Error('请先配置API Key')
      }
      this.loading = true
      this.error = ''
      try {
        const path = params.inputImages?.length ? this.settings.editPath : this.settings.generatePath
        const result = await imageApiClient.generate(params, this.settings.apiKeys, this.settings.baseUrl, path)
        this.currentTask = result
        await localStorageService.addHistory(result)
        this.historyList.unshift(result)
        this.historyTotal += 1
        return result
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    async loadHistory(page = 1, pageSize = 20) {
      const { list, total } = await localStorageService.getHistory(page, pageSize)
      this.historyList = list
      this.historyTotal = total
    },

    async deleteHistory(id: string) {
      await localStorageService.deleteHistory(id)
      this.historyList = this.historyList.filter(item => item.id !== id)
      this.historyTotal -= 1
    },

    async clearHistory() {
      await localStorageService.clearHistory()
      this.historyList = []
      this.historyTotal = 0
    }
  }
})
