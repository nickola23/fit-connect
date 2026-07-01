BEGIN;

CREATE TYPE user_role AS ENUM ('ADMIN', 'TRAINER', 'CLIENT');
CREATE TYPE registration_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE training_location AS ENUM ('GYM', 'HOME');
CREATE TYPE credential_type AS ENUM ('LICENSE', 'DIPLOMA', 'COURSE_CERTIFICATE');
CREATE TYPE cooperation_status AS ENUM ('PENDING', 'ACCEPTED', 'ACTIVE', 'REJECTED', 'ENDED');
CREATE TYPE training_type AS ENUM ('LIVE', 'ASSIGNED');
CREATE TYPE training_status AS ENUM ('SCHEDULED', 'COMPLETED', 'MISSED');
CREATE TYPE report_status AS ENUM ('OPEN', 'REVIEWED', 'DISMISSED');
CREATE TYPE notification_type AS ENUM (
    'COOPERATION_ACCEPTED',
    'COOPERATION_REJECTED',
    'MEMBERSHIP_EXPIRING',
    'STATISTICS'
);

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(150)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    language      VARCHAR(10)   NOT NULL DEFAULT 'sr',
    role          user_role     NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE admins (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE trainers (
    user_id             INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    registration_status registration_status NOT NULL DEFAULT 'PENDING',
    education           TEXT,
    bio                 TEXT,
    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clients (
    user_id           INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    goal              TEXT,
    training_location training_location,
    free_trial_used   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE credentials (
    id          SERIAL PRIMARY KEY,
    trainer_id  INT NOT NULL REFERENCES trainers(user_id) ON DELETE CASCADE,
    type        credential_type NOT NULL,
    file_url    VARCHAR(500) NOT NULL,
    issued_by   VARCHAR(255),
    upload_date DATE NOT NULL DEFAULT CURRENT_DATE
);
CREATE INDEX idx_credentials_trainer ON credentials(trainer_id);

CREATE TABLE pricing_tiers (
    id                 SERIAL PRIMARY KEY,
    trainer_id         INT NOT NULL REFERENCES trainers(user_id) ON DELETE CASCADE,
    sessions_per_week  SMALLINT NOT NULL CHECK (sessions_per_week > 0),
    monthly_price      NUMERIC(10, 2) NOT NULL CHECK (monthly_price >= 0),
    active             BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (trainer_id, sessions_per_week)
);
CREATE INDEX idx_pricing_tiers_trainer ON pricing_tiers(trainer_id);

CREATE TABLE equipment (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE exercises (
    id             SERIAL PRIMARY KEY,
    trainer_id     INT NOT NULL REFERENCES trainers(user_id) ON DELETE CASCADE,
    name           VARCHAR(200) NOT NULL,
    default_reps   SMALLINT NOT NULL CHECK (default_reps > 0),
    default_sets   SMALLINT NOT NULL CHECK (default_sets > 0),
    demo_video_url VARCHAR(500)
);
CREATE INDEX idx_exercises_trainer ON exercises(trainer_id);

CREATE TABLE exercise_equipment (
    exercise_id  INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    equipment_id INT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (exercise_id, equipment_id)
);

CREATE TABLE client_equipment (
    client_id    INT NOT NULL REFERENCES clients(user_id) ON DELETE CASCADE,
    equipment_id INT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (client_id, equipment_id)
);

CREATE TABLE health_records (
    id               SERIAL PRIMARY KEY,
    client_id        INT NOT NULL REFERENCES clients(user_id) ON DELETE CASCADE,
    record_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    weight           NUMERIC(5, 2),
    height           NUMERIC(5, 2),
    health_condition TEXT
);
CREATE INDEX idx_health_records_client ON health_records(client_id, record_date);

CREATE TABLE cooperations (
    id               SERIAL PRIMARY KEY,
    trainer_id       INT NOT NULL REFERENCES trainers(user_id),
    client_id        INT NOT NULL REFERENCES clients(user_id),
    pricing_tier_id  INT REFERENCES pricing_tiers(id), 
    status           cooperation_status NOT NULL DEFAULT 'PENDING',
    request_date     TIMESTAMPTZ NOT NULL DEFAULT now(),
    start_date       DATE,
    end_date         DATE,
    is_free_trial    BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_pricing_tier_or_trial
        CHECK (is_free_trial = TRUE OR pricing_tier_id IS NOT NULL)
);
CREATE INDEX idx_cooperations_trainer ON cooperations(trainer_id);
CREATE INDEX idx_cooperations_client ON cooperations(client_id);

CREATE UNIQUE INDEX uq_one_active_cooperation_per_client
    ON cooperations (client_id)
    WHERE status IN ('ACCEPTED', 'ACTIVE');

CREATE UNIQUE INDEX uq_one_free_trial_per_client
    ON cooperations (client_id)
    WHERE is_free_trial = TRUE;

CREATE TABLE payments (
    id             SERIAL PRIMARY KEY,
    cooperation_id INT NOT NULL REFERENCES cooperations(id) ON DELETE CASCADE,
    payment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    amount         NUMERIC(10, 2) NOT NULL CHECK (amount >= 0)
);
CREATE INDEX idx_payments_cooperation ON payments(cooperation_id);

CREATE TABLE trainings (
    id             SERIAL PRIMARY KEY,
    cooperation_id INT NOT NULL REFERENCES cooperations(id) ON DELETE CASCADE,
    training_type  training_type NOT NULL,
    training_date  DATE NOT NULL,
    status         training_status NOT NULL DEFAULT 'SCHEDULED'
);
CREATE INDEX idx_trainings_cooperation ON trainings(cooperation_id);

CREATE TABLE live_trainings (
    training_id  INT PRIMARY KEY REFERENCES trainings(id) ON DELETE CASCADE,
    meeting_link VARCHAR(500)
);

CREATE TABLE assigned_trainings (
    training_id INT PRIMARY KEY REFERENCES trainings(id) ON DELETE CASCADE,
    target_date DATE NOT NULL
);

CREATE TABLE training_exercises (
    id                 SERIAL PRIMARY KEY,
    training_id        INT NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    exercise_id        INT NOT NULL REFERENCES exercises(id),
    assigned_reps      SMALLINT NOT NULL CHECK (assigned_reps > 0),
    assigned_sets      SMALLINT NOT NULL CHECK (assigned_sets > 0),
    completed          BOOLEAN NOT NULL DEFAULT FALSE,
    difficulty_rating  SMALLINT CHECK (difficulty_rating BETWEEN 1 AND 5),
    client_comment     TEXT
);
CREATE INDEX idx_training_exercises_training ON training_exercises(training_id);
CREATE INDEX idx_training_exercises_exercise ON training_exercises(exercise_id);

CREATE TABLE training_reviews (
    id                            SERIAL PRIMARY KEY,
    training_id                   INT NOT NULL UNIQUE REFERENCES trainings(id) ON DELETE CASCADE,
    trainer_id                    INT NOT NULL REFERENCES trainers(user_id),
    rating                        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment                       TEXT,
    visible_to_other_trainers_only BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE trainer_reviews (
    id         SERIAL PRIMARY KEY,
    trainer_id INT NOT NULL REFERENCES trainers(user_id) ON DELETE CASCADE,
    client_id  INT NOT NULL REFERENCES clients(user_id) ON DELETE CASCADE,
    rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (trainer_id, client_id)
);
CREATE INDEX idx_trainer_reviews_trainer ON trainer_reviews(trainer_id);

CREATE TABLE client_reports (
    id         SERIAL PRIMARY KEY,
    client_id  INT NOT NULL REFERENCES clients(user_id) ON DELETE CASCADE,
    trainer_id INT NOT NULL REFERENCES trainers(user_id) ON DELETE CASCADE,
    report_text TEXT NOT NULL,
    report_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    status     report_status NOT NULL DEFAULT 'OPEN'
);
CREATE INDEX idx_client_reports_trainer ON client_reports(trainer_id);

CREATE TABLE chat_messages (
    id          SERIAL PRIMARY KEY,
    sender_id   INT NOT NULL REFERENCES users(id),
    receiver_id INT NOT NULL REFERENCES users(id),
    message_text TEXT NOT NULL,
    sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    forwarded_via_email BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_sender_receiver_distinct CHECK (sender_id <> receiver_id)
);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(sender_id, receiver_id, sent_at);
CREATE INDEX idx_chat_messages_receiver ON chat_messages(receiver_id, is_read);

CREATE TABLE system_notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       notification_type NOT NULL,
    notif_text TEXT NOT NULL,
    sent_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_read    BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_system_notifications_user ON system_notifications(user_id, is_read);

COMMIT;