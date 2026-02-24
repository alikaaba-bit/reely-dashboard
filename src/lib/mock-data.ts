// REAL DATA from Reely Excel file
// Source: /Users/ali/.openclaw/media/inbound/file_23---4d58603b-e29a-4a31-b0a7-8ae4bf36414d.xlsx

// Real MRR from Clients tab
export const realClients = [
  { company: 'Body Restore', status: 'Active', monthly_rate: 3499, additional: 0 },
  { company: 'People Finders', status: 'Active', monthly_rate: 1999, additional: 0 },
  { company: 'Koi', status: 'Active', monthly_rate: 5499, additional: 0 },
  { company: 'Brandon Agency', status: 'Active', monthly_rate: 3499, additional: 0 },
  { company: 'Kalm', status: 'Active', monthly_rate: 1999, additional: 0 },
  { company: 'Curve Communications', status: 'Active', monthly_rate: 1800, additional: 0 },
  { company: '51 Labs', status: 'Active', monthly_rate: 3499, additional: 0 },
  { company: 'Freshly Pressed', status: 'Active', monthly_rate: 3350, additional: 0 },
  { company: 'Good Moose', status: 'Active', monthly_rate: 1999, additional: 0 },
  { company: 'Hydra Fab', status: 'Active', monthly_rate: 3200, additional: 0 },
  { company: 'Infinite Agency', status: 'Active', monthly_rate: 3499, additional: 0 },
]

// Calculate real MRR totals
const activeClients = realClients.filter(c => c.status === 'Active')
const calculatedMRR = activeClients.reduce((sum, client) => sum + client.monthly_rate + client.additional, 0)
const activeCount = activeClients.length

// Function to get current MRR (checks for synced data first)
export function getCurrentMRR() {
  try {
    // Try to import synced data from sync route
    // This will be populated when the sync button is clicked
    const { getSyncedData } = require('../app/api/sync/route')
    const synced = getSyncedData()
    if (synced) {
      return {
        mrr: synced.mrr,
        active_clients: synced.activeClients,
        avg_revenue_per_client: synced.activeClients > 0 ? synced.mrr / synced.activeClients : 0,
        new_clients: 0,
        churned_clients: 0,
      }
    }
  } catch {
    // Fallback to calculated values if sync data not available
  }

  return {
    mrr: calculatedMRR,
    active_clients: activeCount,
    avg_revenue_per_client: activeCount > 0 ? calculatedMRR / activeCount : 0,
    new_clients: 0,
    churned_clients: 0,
  }
}

export const realMRR = getCurrentMRR()

// One-off project revenue (non-recurring)
export const oneOffProjects = {
  thisMonth: 0, // To be populated from Google Sheet - syncs weekly
  lastMonth: 0,
  ytd: 0,
}

// Mock history based on real MRR trajectory (estimated)
export const mockMrrHistory = [
  { date: '2025-09-01', mrr: 28000, active_clients: 9 },
  { date: '2025-10-01', mrr: 29500, active_clients: 9 },
  { date: '2025-11-01', mrr: 31000, active_clients: 10 },
  { date: '2025-12-01', mrr: 32500, active_clients: 10 },
  { date: '2026-01-01', mrr: 33842, active_clients: 11 },
  { date: '2026-02-01', mrr: 36342, active_clients: 11 },
]

// Mock Mercury data (placeholder until real API connected)
// NOTE: Using Highbeam balance ($29,074.35) as primary cash source
// Mercury API will be added later for secondary account
export const mockMercuryData = {
  balance: 29074.35,
  history: [
    { date: '2026-01-20', balance: 35000 },
    { date: '2026-01-21', balance: 34800 },
    { date: '2026-01-22', balance: 34500 },
    { date: '2026-01-23', balance: 34000 },
    { date: '2026-01-24', balance: 33800 },
    { date: '2026-01-25', balance: 33500 },
    { date: '2026-01-26', balance: 33200 },
    { date: '2026-01-27', balance: 33000 },
    { date: '2026-01-28', balance: 32800 },
    { date: '2026-01-29', balance: 32500 },
    { date: '2026-01-30', balance: 32000 },
    { date: '2026-01-31', balance: 31500 },
    { date: '2026-02-01', balance: 31000 },
    { date: '2026-02-02', balance: 30500 },
    { date: '2026-02-03', balance: 30200 },
    { date: '2026-02-04', balance: 29800 },
    { date: '2026-02-05', balance: 29500 },
    { date: '2026-02-06', balance: 29200 },
    { date: '2026-02-07', balance: 29100 },
    { date: '2026-02-08', balance: 29074 },
  ],
  timestamp: new Date().toISOString(),
}

// Mock ClickUp pipeline (placeholder until real API connected)
export const mockClickUpData = {
  stages: [
    {
      name: 'Prospecting',
      deals: [
        { id: '1', name: 'Acme Corp', value: 15000 },
        { id: '2', name: 'TechStart Inc', value: 25000 },
      ],
      totalValue: 40000,
      count: 2,
    },
    {
      name: 'Proposal Sent',
      deals: [
        { id: '3', name: 'StartupXYZ', value: 32000 },
        { id: '4', name: 'Digital First', value: 22000 },
      ],
      totalValue: 54000,
      count: 2,
    },
    {
      name: 'Negotiation',
      deals: [
        { id: '5', name: 'NextGen Co', value: 42000 },
      ],
      totalValue: 42000,
      count: 1,
    },
    {
      name: 'Closed Won',
      deals: [
        { id: '6', name: 'New Client Alpha', value: 35000 },
        { id: '7', name: 'New Client Beta', value: 28000 },
      ],
      totalValue: 63000,
      count: 2,
    },
    {
      name: 'Closed Lost',
      deals: [],
      totalValue: 0,
      count: 0,
    },
  ],
  summary: {
    totalPipelineValue: 136000,
    totalDeals: 5,
    wonValue: 63000,
    wonCount: 2,
    lostValue: 0,
    lostCount: 0,
    winRate: 100,
  },
  timestamp: new Date().toISOString(),
}

// Real Scorecard data from Excel (Q1 2026 targets)
export const mockScorecardData = {
  quarter: 'Q1',
  year: 2026,
  goals: [
    {
      id: '1',
      metric_name: 'Total Gross Revenue',
      good_target: 50000,
      better_target: 55000,
      best_target: 60000,
      actual_value: 33842,
      unit: 'dollar',
    },
    {
      id: '2',
      metric_name: 'Gross Profit',
      good_target: 25000,
      better_target: 30000,
      best_target: 35000,
      actual_value: 18000,
      unit: 'dollar',
    },
    {
      id: '3',
      metric_name: 'Labour Expenses',
      good_target: 15000,
      better_target: 12000,
      best_target: 10000,
      actual_value: 10565,
      unit: 'dollar',
    },
  ],
  employees: [
    {
      id: '1',
      employee_name: 'Geoff',
      metric_name: 'Deals Closed',
      target_value: 3,
      actual_value: 2,
    },
    {
      id: '2',
      employee_name: 'Fahad',
      metric_name: 'Projects Delivered',
      target_value: 5,
      actual_value: 4,
    },
    {
      id: '3',
      employee_name: 'Micah',
      metric_name: 'Sales Activity',
      target_value: 20,
      actual_value: 15,
    },
  ],
  currentMrr: realMRR,
  mrrHistory: mockMrrHistory,
  clients: realClients,
  timestamp: new Date().toISOString(),
}

// Expenses breakdown (from Google Sheet: Reely Master Scorecard 2026)
// Source: https://docs.google.com/spreadsheets/d/1GIDvoOpWFFAeLljQ_2XiJk92r1F-907_/edit (Expenses tab)
// Last updated: Feb 2026
const staticExpenses = [
  { category: 'Payroll', amount: 14718 },
  { category: 'Software & Marketing', amount: 5609 },
  { category: 'Office & Facilities', amount: 186 },
  { category: 'Bank & Accounting', amount: 153 },
]

// Function to get current expenses (checks for synced data first)
export function getCurrentExpenses() {
  try {
    const { getSyncedData } = require('../app/api/sync/route')
    const synced = getSyncedData()
    if (synced && synced.expenses && synced.expenses.length > 0) {
      return synced.expenses
    }
  } catch {
    // Fallback to static if sync data not available
  }
  return staticExpenses
}

export const mockExpenses = getCurrentExpenses()
