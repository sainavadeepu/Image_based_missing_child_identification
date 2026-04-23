-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Children table
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 18),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    last_seen_location VARCHAR(500) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255),
    image_path VARCHAR(500),
    arcface_embedding vector(512),
    status VARCHAR(20) NOT NULL DEFAULT 'missing' CHECK (status IN ('missing', 'found')),
    alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Search logs table
CREATE TABLE IF NOT EXISTS search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_image_path VARCHAR(500),
    matched_child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    confidence_score FLOAT,
    match_found BOOLEAN NOT NULL DEFAULT FALSE,
    searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(50)
);

-- Index for fast vector similarity search
CREATE INDEX IF NOT EXISTS children_arcface_embedding_idx ON children
    USING ivfflat (arcface_embedding vector_cosine_ops)
    WITH (lists = 100);

-- Index for status filter
CREATE INDEX IF NOT EXISTS children_status_idx ON children (status);
CREATE INDEX IF NOT EXISTS children_created_at_idx ON children (created_at DESC);
CREATE INDEX IF NOT EXISTS search_logs_searched_at_idx ON search_logs (searched_at DESC);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
