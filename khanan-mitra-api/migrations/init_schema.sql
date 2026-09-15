-- ============================================================
-- KHANAN MITRA DASHBOARD — COMPLETE SCHEMA
-- Run once against Neon PostgreSQL
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── VTC (Vocational Training Centres) ─────────────────────────────────────────
CREATE TABLE vtc (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    district        TEXT NOT NULL,
    state           TEXT NOT NULL DEFAULT 'Jharkhand',
    sector          TEXT NOT NULL
                    CHECK (sector IN ('coal', 'steel', 'mica', 'other')),
    latitude        NUMERIC,
    longitude       NUMERIC,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Workers ────────────────────────────────────────────────────────────────────
CREATE TABLE worker (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vtc_id                  UUID NOT NULL REFERENCES vtc(id) ON DELETE RESTRICT,
    short_worker_id         CHAR(4) NOT NULL UNIQUE,
    full_name               TEXT NOT NULL,
    phone_number            TEXT NOT NULL UNIQUE,
    department              TEXT NOT NULL,
    contractor              TEXT,
    blood_group             TEXT,
    preferred_language      TEXT NOT NULL DEFAULT 'hi'
                            CHECK (preferred_language IN ('hi', 'sat', 'en')),
    is_active               BOOLEAN NOT NULL DEFAULT true,
    badge_issued_at         TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Training Scenarios ─────────────────────────────────────────────────────────
CREATE TABLE training_scenario (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_key        TEXT NOT NULL UNIQUE,
    title_en            TEXT NOT NULL,
    title_hi            TEXT NOT NULL,
    title_sat           TEXT NOT NULL,
    passing_threshold   NUMERIC NOT NULL DEFAULT 0.70,
    total_steps         INTEGER NOT NULL,
    version             INTEGER NOT NULL DEFAULT 1,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Completion Logs ────────────────────────────────────────────────────────────
CREATE TABLE completion_log (
    id                      UUID PRIMARY KEY,
    -- UUID comes from Android device — deduplication key
    worker_id               UUID NOT NULL REFERENCES worker(id),
    scenario_id             UUID NOT NULL REFERENCES training_scenario(id),
    device_android_id       TEXT NOT NULL,
    score                   NUMERIC NOT NULL CHECK (score >= 0 AND score <= 1),
    passed                  BOOLEAN NOT NULL,
    total_attempts          INTEGER NOT NULL DEFAULT 1,
    duration_seconds        INTEGER,
    completed_at            TIMESTAMPTZ NOT NULL,
    -- device local time
    verified_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- backend server time — used for certificate validity
    sync_path               TEXT NOT NULL
                            CHECK (sync_path IN ('internet', 'lan', 'qr_manual')),
    certificate_issued      BOOLEAN NOT NULL DEFAULT false,
    certificate_jwt         TEXT,
    certificate_issued_at   TIMESTAMPTZ,
    certificate_expires_at  TIMESTAMPTZ,
    -- always verified_at + 90 days
    is_flagged              BOOLEAN NOT NULL DEFAULT false,
    flagged_reason          TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Step Logs ──────────────────────────────────────────────────────────────────
CREATE TABLE step_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    completion_log_id   UUID NOT NULL REFERENCES completion_log(id),
    worker_id           UUID NOT NULL REFERENCES worker(id),
    scenario_id         UUID NOT NULL REFERENCES training_scenario(id),
    step_key            TEXT NOT NULL,
    step_index          INTEGER NOT NULL,
    action_taken        TEXT NOT NULL,
    correct             BOOLEAN NOT NULL,
    points_awarded      INTEGER NOT NULL,
    time_taken_seconds  INTEGER NOT NULL,
    attempt_number      INTEGER NOT NULL DEFAULT 1,
    recorded_at         TIMESTAMPTZ NOT NULL
);

-- ── Devices ────────────────────────────────────────────────────────────────────
CREATE TABLE device (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vtc_id                  UUID NOT NULL REFERENCES vtc(id),
    device_label            TEXT NOT NULL,
    android_id              TEXT UNIQUE,
    last_synced_at          TIMESTAMPTZ,
    last_heartbeat_at       TIMESTAMPTZ,
    pending_records         INTEGER NOT NULL DEFAULT 0,
    app_version             TEXT,
    encryption_key_version  INTEGER NOT NULL DEFAULT 1,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Admin Users ────────────────────────────────────────────────────────────────
CREATE TABLE admin_user (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    role            TEXT NOT NULL
                    CHECK (role IN ('super_admin', 'safety_officer', 'dgms_inspector')),
    vtc_id          UUID REFERENCES vtc(id),
    -- null for super_admin
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ
);

-- ── Audit Log ──────────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type      TEXT NOT NULL
                    CHECK (actor_type IN ('admin_user', 'device', 'system')),
    actor_id        UUID,
    action          TEXT NOT NULL,
    target_table    TEXT,
    target_id       UUID,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Revoked Certificates ───────────────────────────────────────────────────────
CREATE TABLE revoked_certificate (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    completion_log_id   UUID NOT NULL REFERENCES completion_log(id),
    revoked_by          UUID NOT NULL REFERENCES admin_user(id),
    reason              TEXT NOT NULL,
    revoked_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
-- Worker registry search
CREATE INDEX idx_worker_vtc
    ON worker(vtc_id);
CREATE INDEX idx_worker_short_id
    ON worker(short_worker_id);
CREATE INDEX idx_worker_phone
    ON worker(phone_number);
CREATE INDEX idx_worker_language
    ON worker(preferred_language);
CREATE INDEX idx_worker_active
    ON worker(is_active);

-- Completion log dashboard queries
CREATE INDEX idx_completion_worker
    ON completion_log(worker_id);
CREATE INDEX idx_completion_scenario
    ON completion_log(scenario_id);
CREATE INDEX idx_completion_expires
    ON completion_log(certificate_expires_at);
CREATE INDEX idx_completion_flagged
    ON completion_log(is_flagged)
    WHERE is_flagged = true;
CREATE INDEX idx_completion_passed
    ON completion_log(passed);
CREATE INDEX idx_completion_sync_path
    ON completion_log(sync_path);
CREATE INDEX idx_completion_verified_at
    ON completion_log(verified_at DESC);

-- Step analytics
CREATE INDEX idx_step_scenario
    ON step_log(scenario_id);
CREATE INDEX idx_step_correct
    ON step_log(scenario_id, step_key, correct);
CREATE INDEX idx_step_completion
    ON step_log(completion_log_id);

-- Device health
CREATE INDEX idx_device_vtc
    ON device(vtc_id);
CREATE INDEX idx_device_heartbeat
    ON device(last_heartbeat_at);
CREATE INDEX idx_device_synced
    ON device(last_synced_at);

-- Audit trail
CREATE INDEX idx_audit_actor
    ON audit_log(actor_id, actor_type);
CREATE INDEX idx_audit_created
    ON audit_log(created_at DESC);

-- ============================================================
-- SEED: Two training scenarios (matches Android modules)
-- ============================================================
INSERT INTO training_scenario (
    scenario_key, title_en, title_hi, title_sat,
    passing_threshold, total_steps, version
) VALUES
(
    'fire_response_v1',
    'Fire & Explosion Response',
    'आग एवं विस्फोट प्रतिक्रिया',
    'ᱦᱩᱲ ᱟᱨ ᱵᱤᱥᱯᱷᱚᱴ ᱯᱨᱚᱛᱤᱠᱽᱨᱤᱭᱟ',
    0.70,
    6,
    1
),
(
    'gas_leak_v1',
    'Gas Leak & Confined Space Protocol',
    'गैस रिसाव एवं सीमित स्थान प्रोटोकॉल',
    'ᱜᱮᱥ ᱨᱤᱥᱟᱣ ᱟᱨ ᱥᱤᱢᱤᱛ ᱡᱟᱭᱜᱟ',
    0.70,
    5,
    1
);