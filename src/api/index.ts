import axios from '@/utils/request'
import type { TaskParams, GenerateResult } from '@/types'
import { generateRandomId } from '@/utils'

class ImageApiClient {
  private static instance: ImageApiClient
  private currentKeyIndex = 0
  private maxRetries = 3
  private baseDelay = 1000

  private constructor() {}

  public static getInstance(): ImageApiClient {
    if (!ImageApiClient.instance) {
      ImageApiClient.instance = new ImageApiClient()
    }
    return ImageApiClient.instance
  }

  async generate(params: TaskParams, apiKeys: string[], baseUrl: string, path: string): Promise<GenerateResult> {
    const startTime = Date.now()
    const isImageToImage = !!params.inputImages?.length

    for (let retry = 0; retry < this.maxRetries; retry++) {
      const currentKey = apiKeys[this.currentKeyIndex % apiKeys.length]
      this.currentKeyIndex++

      try {
        let response
        if (isImageToImage) {
          const formData = new FormData()
          formData.append('prompt', params.prompt)
          if (params.negativePrompt) formData.append('negative_prompt', params.negativePrompt)
          formData.append('width', String(params.width))
          formData.append('height', String(params.height))
          formData.append('steps', String(params.steps))
          formData.append('cfg_scale', String(params.cfg))
          formData.append('sampler_name', params.sampler)
          formData.append('seed', String(params.seed))
          formData.append('batch_size', String(params.numImages))
          params.inputImages?.forEach(file => formData.append('init_images', file))

          response = await axios.post(`${baseUrl}${path}`, formData, {
            headers: {
              'Authorization': `Bearer ${currentKey}`,
              'Content-Type': 'multipart/form-data'
            },
            timeout: 120000
          })
        } else {
          const payload = {
            prompt: params.prompt,
            negative_prompt: params.negativePrompt,
            width: params.width,
            height: params.height,
            steps: params.steps,
            cfg_scale: params.cfg,
            sampler_name: params.sampler,
            seed: params.seed,
            batch_size: params.numImages
          }

          response = await axios.post(`${baseUrl}${path}`, payload, {
            headers: {
              'Authorization': `Bearer ${currentKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 120000
          })
        }

        const images = response.data.images || response.data.data?.map((item: any) => item.b64_json || item.url) || []
        return {
          id: generateRandomId(),
          prompt: params.prompt,
          negativePrompt: params.negativePrompt,
          parameters: {
            width: params.width,
            height: params.height,
            steps: params.steps,
            cfg: params.cfg,
            sampler: params.sampler,
            seed: params.seed,
            numImages: params.numImages
          },
          images: images,
          createTime: Date.now(),
          costTime: Date.now() - startTime
        }

      } catch (error) {
        console.error(`API请求失败 (Key ${this.currentKeyIndex % apiKeys.length}, 重试 ${retry + 1}/${this.maxRetries}):`, error)
        if (retry === this.maxRetries - 1) {
          throw new Error(`所有API Key均请求失败: ${(error as Error).message}`)
        }
        const delay = this.baseDelay * Math.pow(2, retry)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw new Error('请求超出最大重试次数')
  }
}

export const imageApiClient = ImageApiClient.getInstance()
