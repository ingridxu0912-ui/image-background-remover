'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Download, Image as ImageIcon, Loader2, X, Check, AlertCircle } from 'lucide-react'

interface ProcessedImage {
  original: string
  result: string
  blob: Blob
}

export default function Home() {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return '仅支持 JPG、PNG、WebP 格式的图片'
    }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return '图片大小不能超过 5MB'
    }
    return null
  }

  const processImage = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const originalUrl = URL.createObjectURL(file)
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '处理失败')
      }
      
      const resultBlob = await response.blob()
      const resultUrl = URL.createObjectURL(resultBlob)

      setProcessedImage({
        original: originalUrl,
        result: resultUrl,
        blob: resultBlob,
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : '处理失败，请稍后重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImage(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      processImage(file)
    }
  }, [])

  const handleDownload = () => {
    if (processedImage) {
      const url = URL.createObjectURL(processedImage.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `no-bg-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleReset = () => {
    setProcessedImage(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🎨 AI 智能抠图
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            一键去除图片背景，完全免费，无需注册
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {!processedImage ? (
            <div
              className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50 scale-105'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                拖放图片到这里
              </h2>
              <p className="text-gray-500 mb-6">
                支持 JPG、PNG、WebP 格式，最大 5MB
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                选择文件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">处理结果</h2>
                <button
                  onClick={handleReset}
                  className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  重新上传
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    原图
                  </h3>
                  <div className="rounded-xl overflow-hidden bg-gray-200">
                    <img
                      src={processedImage.original}
                      alt="原图"
                      className="w-full h-auto max-h-80 object-contain"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    抠图结果
                  </h3>
                  <div className="rounded-xl overflow-hidden checkerboard">
                    <img
                      src={processedImage.result}
                      alt="抠图结果"
                      className="w-full h-auto max-h-80 object-contain"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full max-w-md mx-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Download className="w-6 h-6" />
                下载抠图结果
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <footer className="text-center mt-12 text-white/70">
          <p>由 AI 驱动 | 免费使用 | 图片仅在内存中处理，不会保存到服务器</p>
        </footer>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">AI 正在处理中，请稍候...</p>
          </div>
        </div>
      )}
    </main>
  )
}
