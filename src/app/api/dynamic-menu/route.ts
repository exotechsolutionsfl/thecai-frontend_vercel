import { NextResponse } from 'next/server'
import { apiFetch } from '@api/api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const make = searchParams.get('make')
  const model = searchParams.get('model')
  const year = searchParams.get('year')
  const parentUid = searchParams.get('parent_uid')

  if (!make || !model || !year) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    const params = new URLSearchParams({ make, model, year })
    if (parentUid !== null) params.append('parent_uid', parentUid)

    const data = await apiFetch(`dynamic-menu?${params.toString()}`)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching dynamic menu:', error)
    return NextResponse.json({ error: 'Failed to fetch menu data' }, { status: 500 })
  }
}