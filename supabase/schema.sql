-- ==============================================================================
-- KHANHAN - HOLISTIC WELLNESS & TELE-THERAPY HUB
-- SUPABASE / POSTGRESQL DATABASE SCHEMA (DDL)
-- Compliant with:
-- 1. Vietnam Decree 356/2025/ND-CP on Personal Data Protection
-- 2. HIPAA Security Rule (ePHI Encryption & Admin Blinded Access)
-- 3. OWASP Top 10 (Injection, Broken Access Control, Security Misconfiguration)
-- 4. Double-Booking Concurrency Control via Unique Constraint
-- ==============================================================================

-- Enable UUID Extension and Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USER ACCOUNTS & ROLES (RBAC)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('CLIENT', 'THERAPIST', 'CONTENT_CREATOR', 'ADMIN')),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'ANONYMIZED')),
    wallet_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance >= 0),
    zen_points INT NOT NULL DEFAULT 0,
    is_vip BOOLEAN NOT NULL DEFAULT FALSE,
    vip_expires_at TIMESTAMPTZ,
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. THERAPIST CREDENTIALS & LICENSING (Compliant with Law 15/2023/QH15)
CREATE TABLE IF NOT EXISTS public.therapist_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    license_authority VARCHAR(255) NOT NULL,
    biography TEXT,
    consultation_fee NUMERIC(12, 2) NOT NULL CHECK (consultation_fee >= 0),
    is_verified_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
    verification_date TIMESTAMPTZ,
    rating_average NUMERIC(3, 2) DEFAULT 5.00,
    rating_count INT DEFAULT 0,
    weekly_availability_json JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 3. SENSITIVE HEALTH ASSESSMENTS (Decree 356/2025 Art. 4 & 6 - Encrypted ePHI)
CREATE TABLE IF NOT EXISTS public.health_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    encrypted_payload TEXT NOT NULL, -- AES-GCM-256 Ciphertext
    iv VARCHAR(64) NOT NULL,
    encryption_algo VARCHAR(50) NOT NULL DEFAULT 'AES-GCM-256',
    explicit_consent_given BOOLEAN NOT NULL DEFAULT FALSE CHECK (explicit_consent_given = TRUE),
    decree_356_consent_text TEXT NOT NULL,
    consent_recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address_hash VARCHAR(128)
);

-- 4. TELE-THERAPY APPOINTMENTS (Double-Booking Concurrency Lock)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID NOT NULL REFERENCES public.users(id),
    client_id UUID NOT NULL REFERENCES public.users(id),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    fee NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    video_meeting_url TEXT NOT NULL,
    medical_disclaimer_acknowledged BOOLEAN NOT NULL DEFAULT FALSE CHECK (medical_disclaimer_acknowledged = TRUE),
    refund_percentage INT DEFAULT 0 CHECK (refund_percentage IN (0, 100)),
    refund_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    -- BUSINESS RULE 1: Concurrency Control preventing double-booking on database level
    CONSTRAINT unique_therapist_slot UNIQUE (therapist_id, appointment_date, start_time)
);

-- 5. ENCRYPTED CONSULTATION NOTES (HIPAA Security Rule & Decree 356 Art. 4)
CREATE TABLE IF NOT EXISTS public.consultation_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES public.users(id),
    client_id UUID NOT NULL REFERENCES public.users(id),
    encrypted_content TEXT NOT NULL, -- Client-side AES-GCM encrypted
    iv VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. WELLNESS CONTENT & VIP SUBSCRIPTION CATALOG
CREATE TABLE IF NOT EXISTS public.wellness_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content_body TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('ARTICLE', 'VIDEO', 'AUDIO_GUIDE')),
    media_url TEXT,
    author_id UUID NOT NULL REFERENCES public.users(id),
    is_vip_only BOOLEAN NOT NULL DEFAULT FALSE,
    cover_image TEXT,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. HABIT TRACKING & GAMIFICATION LOGS
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    water_glasses INT DEFAULT 0,
    sleep_hours NUMERIC(4, 1) DEFAULT 0.0,
    mood VARCHAR(50) CHECK (mood IN ('PEACEFUL', 'GOOD', 'NEUTRAL', 'STRESSED', 'ANXIOUS')),
    mindfulness_minutes INT DEFAULT 0,
    zen_points_earned INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_daily_log UNIQUE (user_id, log_date)
);

-- 8. REVIEWS & RATINGS (Post-session verification)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES public.appointments(id),
    therapist_id UUID NOT NULL REFERENCES public.users(id),
    client_id UUID NOT NULL REFERENCES public.users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_moderated BOOLEAN NOT NULL DEFAULT FALSE,
    moderation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. DECREE 356/2025 72-HOUR INCIDENT & BREACH ALERTS
CREATE TABLE IF NOT EXISTS public.incident_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    affected_scope TEXT NOT NULL,
    remedial_actions TEXT NOT NULL,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decree_356_deadline TIMESTAMPTZ NOT NULL, -- reported_at + 72 hours
    status VARCHAR(50) NOT NULL DEFAULT 'NOTIFIED_USERS',
    broadcasted_to_users BOOLEAN NOT NULL DEFAULT TRUE
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enforcing HIPAA & Decree 356 Access Boundaries
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- HIPAA RESTRICTION: Admin is BLINDED from consultation notes
CREATE POLICY therapist_client_only_notes ON public.consultation_notes
    FOR ALL
    USING (auth.uid() = therapist_id OR auth.uid() = client_id);

-- End of Supabase Schema
