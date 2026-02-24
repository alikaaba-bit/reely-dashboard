import { NextResponse } from 'next/server'
import { writeFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1GIDvoOpWFFAeLljQ_2XiJk92r1F-907_'
const CLIENTS_GID = process.env.GOOGLE_SHEET_CLIENTS_GID || '0' // Set via env var

interface ClientRow {
  company: string
  status: string
  monthly_rate: number
  additional: number
  one_off_project?: number
}

export async function POST(request: Request) {
  try {
    // Fetch clients sheet
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${CLIENTS_GID}`
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to fetch Google Sheet',
        details: `Status: ${response.status}`,
        hint: 'Make sure GOOGLE_SHEET_CLIENTS_GID env var is set correctly'
      }, { status: 500 })
    }

    const csvText = await response.text()
    const lines = csvText.trim().split('\n')

    if (lines.length < 2) {
      return NextResponse.json({ error: 'Empty sheet' }, { status: 400 })
    }

    // Parse CSV (assumes: Company, Status, Monthly Rate, Additional, One-Off Project)
    const clients: ClientRow[] = []
    let totalMRR = 0
    let activeCount = 0
    let totalOneOff = 0

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''))

      if (cols.length < 3) continue

      const company = cols[0]
      const status = cols[1] || 'Active'
      const monthlyRate = parseFloat(cols[2]?.replace(/[$,]/g, '') || '0')
      const additional = parseFloat(cols[3]?.replace(/[$,]/g, '') || '0')
      const oneOff = parseFloat(cols[4]?.replace(/[$,]/g, '') || '0')

      if (!company || company.toLowerCase().includes('total')) continue

      clients.push({ company, status, monthly_rate: monthlyRate, additional, one_off_project: oneOff })

      if (status.toLowerCase() === 'active') {
        totalMRR += monthlyRate + additional
        activeCount++
        totalOneOff += oneOff || 0
      }
    }

    // Update mock-data.ts file
    const mockDataPath = join(process.cwd(), 'src', 'lib', 'mock-data.ts')

    // Read current file
    let currentContent = ''
    try {
      const fs = await import('fs')
      currentContent = fs.readFileSync(mockDataPath, 'utf-8')
    } catch {
      return NextResponse.json({ error: 'Could not read mock-data.ts' }, { status: 500 })
    }

    // Update realMRR values
    const updatedContent = currentContent
      .replace(/mrr: \d+,.*\/\/ Updated[^\n]*/, `mrr: ${totalMRR}, // Updated ${new Date().toISOString().split('T')[0]}`)
      .replace(/active_clients: \d+,.*\/\/ Updated[^\n]*/, `active_clients: ${activeCount}, // Updated count - syncs from Google Sheet weekly`)
      .replace(/avg_revenue_per_client: [\d.]+/, `avg_revenue_per_client: ${totalMRR / activeCount}`)
      .replace(/thisMonth: \d+,.*\/\/ To be populated[^\n]*/, `thisMonth: ${totalOneOff}, // To be populated from Google Sheet - synced ${new Date().toISOString().split('T')[0]}`)

    writeFileSync(mockDataPath, updatedContent, 'utf-8')

    return NextResponse.json({
      success: true,
      synced_at: new Date().toISOString(),
      clients: activeCount,
      mrr: totalMRR,
      one_off_projects: totalOneOff,
      message: `Synced ${clients.length} clients (${activeCount} active)`,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Sync failed',
      details: String(error)
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger sync',
    sheet_id: SHEET_ID,
    clients_gid: CLIENTS_GID,
    hint: 'Set GOOGLE_SHEET_CLIENTS_GID env var with the correct gid from Google Sheets URL'
  })
}
