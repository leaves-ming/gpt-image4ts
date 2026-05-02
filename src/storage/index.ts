import localforage from 'localforage'
import type { AppSettings, GenerateResult } from '@/types'

const SETTINGS_KEY = 'app_settings'
const HISTORY_KEY = 'generate_history'

class LocalStorageService {
  private static instance: LocalStorageService

  private constructor() {
    localforage.config({
      name: 'AIPlayground',
      version: 1.0,
      storeName: 'ai_storage',
      description: 'AI绘画工具本地存储'
    })
  }

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService()
    }
    return LocalStorageService.instance
  }

  async getSettings(): Promise<Partial<AppSettings>> {
    const settings = await localforage.getItem<AppSettings>(SETTINGS_KEY)
    return settings || {}
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await localforage.setItem(SETTINGS_KEY, settings)
  }

  async addHistory(result: GenerateResult): Promise<void> {
    const history = await this.getAllHistory()
    history.unshift(result)
    await localforage.setItem(HISTORY_KEY, history)
  }

  async getHistory(page = 1, pageSize = 20): Promise<{ list: GenerateResult[]; total: number }> {
    const history = await this.getAllHistory()
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      list: history.slice(start, end),
      total: history.length
    }
  }

  async deleteHistory(id: string): Promise<void> {
    const history = await this.getAllHistory()
    const filtered = history.filter(item => item.id !== id)
    await localforage.setItem(HISTORY_KEY, filtered)
  }

  async clearHistory(): Promise<void> {
    await localforage.removeItem(HISTORY_KEY)
  }

  private async getAllHistory(): Promise<GenerateResult[]> {
    const history = await localforage.getItem<GenerateResult[]>(HISTORY_KEY)
    return history || []
  }
}

export const localStorageService = LocalStorageService.getInstance()
