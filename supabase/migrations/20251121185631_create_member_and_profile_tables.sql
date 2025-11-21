-- Create member table
CREATE TABLE member (
	id BIGSERIAL PRIMARY KEY,
	full_name TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create member_profile table with one-to-one relationship
CREATE TABLE member_profile (
	id BIGSERIAL PRIMARY KEY,
	member_id BIGINT NOT NULL UNIQUE REFERENCES member(id) ON DELETE CASCADE,
	profile_photo TEXT,
	title TEXT,
	affiliation TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on member_id for faster lookups
CREATE INDEX idx_member_profile_member_id ON member_profile(member_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_member_updated_at
	BEFORE UPDATE ON member
	FOR EACH ROW
	EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_profile_updated_at
	BEFORE UPDATE ON member_profile
	FOR EACH ROW
	EXECUTE FUNCTION update_updated_at_column();

