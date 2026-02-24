import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1GIDvoOpWFFAeLljQ_2XiJk92r1F-907_'
const CLIENTS_GID = '1208786387'

export async function GET() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${CLIENTS_GID}`
    const response = await fetch(url)

    const csvText = await response.text()
    const lines = csvText.trim().split('\n')

    // Parse clients
    const clients = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''))
      if (cols.length < 3) continue

      const company = cols[0]
      const status = cols[1] || 'Active'
      const monthlyRate = parseFloat(cols[2]?.replace(/[$,]/g, '') || '0')

      if (!company || company.toLowerCase().includes('total')) continue

      clients.push({
        index: i,
        company,
        status,
        monthlyRate,
        raw: lines[i]
      })
    }

    return NextResponse.json({
      url,
      status: response.status,
      totalLines: lines.length,
      headerLine: lines[0],
      clients,
      activeClients: clients.filter(c => c.status.toLowerCase() === 'active').length,
      rawCsv: csvText.substring(0, 1000) // First 1000 chars
    })
  } catch (error) {
    return NextResponse.json({
      error: String(error)
    }, { status: 500 })
  }
}
