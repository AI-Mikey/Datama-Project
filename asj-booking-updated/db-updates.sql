-- Add user_id column to hosts table
ALTER TABLE hosts ADD COLUMN user_id UUID;

-- Add user_id column to guests table
ALTER TABLE guests ADD COLUMN user_id UUID;

-- Create indexes for faster lookups
CREATE INDEX idx_hosts_user_id ON hosts(user_id);
CREATE INDEX idx_guests_user_id ON guests(user_id);

