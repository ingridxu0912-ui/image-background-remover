import { NextRequest, NextResponse } from 'next/server'

const REMOVE_BG_API = 'https://api.remove.bg/v1.0/removebg'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json(
        { error: '请上传图片文件' },
        { status: 400, headers: corsHeaders }
      )
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: '仅支持 JPG、PNG、WebP 格式的图片' },
        { status: 400, headers: corsHeaders }
      )
    }

    const maxSize = 5 * 1024 * 1024
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: '图片大小不能超过 5MB' },
        { status: 400, headers: corsHeaders }
      )
    }

    const apiKey = process.env.REMOVE_BG_API_KEY
    
    if (!apiKey) {
      console.error('REMOVE_BG_API_KEY not configured')
      return NextResponse.json(
        { error: '服务器未配置 API Key，请联系管理员' },
        { status: 500, headers: corsHeaders }
      )
    }

    const removeBgForm = new FormData()
    removeBgForm.append('image_file', imageFile, imageFile.name)
    removeBgForm.append('size', 'auto')

    const response = await fetch(REMOVE_BG_API, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: removeBgForm,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Remove.bg API error:', errorData)
      return NextResponse.json(
        { error: '去除背景失败，请稍后重试' },
        { status: 500, headers: corsHeaders }
      )
    }

    const processedImage = await response.arrayBuffer()
    
    return new Response(processedImage, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="no-bg-${Date.now()}.png"`,
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500, headers: corsHeaders }
    )
  }
}
