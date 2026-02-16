-- Supabase Migration: Initial Schema for Reely Dashboard

-- Cash position tracking
CREATE TABLE cash_position (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  balance DECIMAL(12,2) NOT NULL,
  account_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- MRR tracking
CREATE TABLE mrr_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mrr DECIMAL(12,2) NOT NULL,
  active_clients INTEGER NOT NULL DEFAULT 0,
  avg_revenue_per_client DECIMAL(10,2),
  new_clients INTEGER DEFAULT 0,
  churned_clients INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Pipeline deals
CREATE TABLE pipeline_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clickup_id TEXT UNIQUE,
  name TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  stage TEXT NOT NULL,
  assignee TEXT,
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense tracking
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scorecard goals
CREATE TABLE scorecard_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quarter TEXT NOT NULL,
  year INTEGER NOT NULL,
  metric_name TEXT NOT NULL,
  good_target DECIMAL(12,2),
  better_target DECIMAL(12,2),
  best_target DECIMAL(12,2),
  actual_value DECIMAL(12,2),
  unit TEXT DEFAULT 'dollar',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quarter, year, metric_name)
);

-- Employee scorecards
CREATE TABLE employee_scorecards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  year INTEGER NOT NULL,
  metric_name TEXT NOT NULL,
  target_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  unit TEXT DEFAULT 'dollar',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync log
CREATE TABLE sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_cash_position_date ON cash_position(date DESC);
CREATE INDEX idx_mrr_date ON mrr_metrics(date DESC);
CREATE INDEX idx_pipeline_stage ON pipeline_deals(stage);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_scorecard_quarter ON scorecard_goals(quarter, year);

-- Enable Row Level Security
ALTER TABLE cash_position ENABLE ROW LEVEL SECURITY;
ALTER TABLE mrr_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecard_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_scorecards ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - add auth later)
CREATE POLICY "Allow all" ON cash_position FOR ALL USING (true);
CREATE POLICY "Allow all" ON mrr_metrics FOR ALL USING (true);
CREATE POLICY "Allow all" ON pipeline_deals FOR ALL USING (true);
CREATE POLICY "Allow all" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all" ON scorecard_goals FOR ALL USING (true);
CREATE POLICY "Allow all" ON employee_scorecards FOR ALL USING (true);
