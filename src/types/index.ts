export interface AppSettings {
  baseUrl: string
  apiKeys: string[]
  model: string
  generatePath: string
  editPath: string
  defaultParams: Partial<TaskParams>
}

export interface TaskParams {
  prompt: string
  negativePrompt?: string
  width: number
  height: number
  steps: number
  cfg: number
  sampler: string
  seed: number
  numImages: number
  inputImages?: File[]
}

export interface GenerateResult {
  id: string
  prompt: string
  negativePrompt?: string
  parameters: Omit<TaskParams, 'inputImages' | 'prompt' | 'negativePrompt'>
  images: string[]
  createTime: number
  costTime?: number
}
