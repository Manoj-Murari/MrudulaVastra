-- Create enquiries table for customer contact form submissions
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public & authenticated) to insert an enquiry via the contact form
CREATE POLICY "Allow public insert to enquiries"
  ON enquiries FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users (admin) to view enquiries
CREATE POLICY "Allow authenticated view enquiries"
  ON enquiries FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users (admin) to update enquiries (e.g. status)
CREATE POLICY "Allow authenticated update enquiries"
  ON enquiries FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Index for fast sorting by created_at
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);
