-- Custode Password Manager - Initial Database Schema
-- Zero-knowledge architecture: all data stored encrypted
-- Users can only access their own data via Row-Level Security

-- ============================================================================
-- TABLES
-- ============================================================================

-- Table: vaults
-- Stores encrypted vault data for each user
-- Each user has exactly one vault containing all their passwords, notes, and dev keys
CREATE TABLE IF NOT EXISTS vaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Encrypted data (JSONB for flexibility)
  encrypted_data jsonb NOT NULL,

  -- Encryption verification check (to validate master password on login)
  encryption_check text NOT NULL,

  -- Cryptographic parameters
  salt text NOT NULL,              -- For PBKDF2 key derivation
  iv text NOT NULL,                -- Initialization vector for AES-GCM

  -- Metadata
  version integer NOT NULL DEFAULT 1,
  last_modified timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),

  -- Ensure one vault per user
  UNIQUE(user_id)
);

-- Table: sync_metadata
-- Tracks devices and sync status for each user
CREATE TABLE IF NOT EXISTS sync_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  device_id text NOT NULL,
  device_name text,
  device_type text CHECK (device_type IN ('web', 'mobile', 'desktop', 'extension')),

  last_sync timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),

  -- One record per device per user
  UNIQUE(user_id, device_id)
);

-- Table: security_events
-- Audit log for security-sensitive events
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  event_type text NOT NULL CHECK (event_type IN (
    'login',
    'logout',
    'vault_access',
    'vault_update',
    'password_change',
    'export',
    'import',
    'device_added',
    'device_removed'
  )),

  device_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb,  -- Additional event-specific data

  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_metadata_user_id ON sync_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);

-- Index on last_modified for sync queries
CREATE INDEX IF NOT EXISTS idx_vaults_last_modified ON vaults(last_modified);
CREATE INDEX IF NOT EXISTS idx_sync_metadata_last_sync ON sync_metadata(last_sync);

-- Index on event_type for security dashboard
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: update_vault_timestamp
-- Automatically updates last_modified when vault is updated
CREATE OR REPLACE FUNCTION update_vault_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: update_sync_timestamp
-- Automatically updates last_sync when sync_metadata is updated
CREATE OR REPLACE FUNCTION update_sync_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_sync = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-update vault timestamp
DROP TRIGGER IF EXISTS trigger_update_vault_timestamp ON vaults;
CREATE TRIGGER trigger_update_vault_timestamp
  BEFORE UPDATE ON vaults
  FOR EACH ROW
  EXECUTE FUNCTION update_vault_timestamp();

-- Trigger: Auto-update sync timestamp
DROP TRIGGER IF EXISTS trigger_update_sync_timestamp ON sync_metadata;
CREATE TRIGGER trigger_update_sync_timestamp
  BEFORE UPDATE ON sync_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_sync_timestamp();

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Policies for vaults table
-- Users can only access their own vault

DROP POLICY IF EXISTS "Users can view own vault" ON vaults;
CREATE POLICY "Users can view own vault"
  ON vaults
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own vault" ON vaults;
CREATE POLICY "Users can insert own vault"
  ON vaults
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own vault" ON vaults;
CREATE POLICY "Users can update own vault"
  ON vaults
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own vault" ON vaults;
CREATE POLICY "Users can delete own vault"
  ON vaults
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for sync_metadata table
-- Users can manage their own sync metadata

DROP POLICY IF EXISTS "Users can manage own sync metadata" ON sync_metadata;
CREATE POLICY "Users can manage own sync metadata"
  ON sync_metadata
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for security_events table
-- Users can view their own events, system can insert

DROP POLICY IF EXISTS "Users can view own security events" ON security_events;
CREATE POLICY "Users can view own security events"
  ON security_events
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert security events" ON security_events;
CREATE POLICY "System can insert security events"
  ON security_events
  FOR INSERT
  WITH CHECK (true);  -- Allow system to log events for any user

-- ============================================================================
-- HELPER FUNCTIONS FOR APPLICATION
-- ============================================================================

-- Function: get_vault_for_user
-- Convenience function to fetch user's vault
CREATE OR REPLACE FUNCTION get_vault_for_user(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  vault_record RECORD;
BEGIN
  SELECT
    encrypted_data,
    encryption_check,
    salt,
    iv,
    version,
    last_modified
  INTO vault_record
  FROM vaults
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'encrypted_data', vault_record.encrypted_data,
    'encryption_check', vault_record.encryption_check,
    'salt', vault_record.salt,
    'iv', vault_record.iv,
    'version', vault_record.version,
    'last_modified', vault_record.last_modified
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: log_security_event
-- Helper to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_device_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO security_events (
    user_id,
    event_type,
    device_id,
    ip_address,
    user_agent,
    metadata
  )
  VALUES (
    p_user_id,
    p_event_type,
    p_device_id,
    inet_client_addr(),  -- Automatically captures client IP
    current_setting('request.headers', true)::json->>'user-agent',  -- User agent from request
    p_metadata
  )
  RETURNING id INTO event_id;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE vaults IS 'Stores encrypted vault data for each user. Zero-knowledge architecture: server cannot decrypt data.';
COMMENT ON COLUMN vaults.encrypted_data IS 'Encrypted JSON containing passwords, notes, and dev keys';
COMMENT ON COLUMN vaults.encryption_check IS 'Encrypted verification string to validate master password';
COMMENT ON COLUMN vaults.salt IS 'Salt for PBKDF2 key derivation (Base64-encoded)';
COMMENT ON COLUMN vaults.iv IS 'Initialization vector for AES-GCM encryption (Base64-encoded)';

COMMENT ON TABLE sync_metadata IS 'Tracks devices and sync status for multi-device support';
COMMENT ON TABLE security_events IS 'Audit log for security-sensitive operations';

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- No initial data needed for MVP
-- Future: Could add default settings, feature flags, etc.
