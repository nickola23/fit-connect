BEGIN;

-- =====================================================================
-- 1. USERS (Admins, Trainers, Clients)
-- =====================================================================
INSERT INTO users (id, name, email, password_hash, language, role, created_at) VALUES
(1, 'Admin Pera', 'admin@fitplatform.com', 'hash_admin_123', 'sr', 'ADMIN', now()),
(2, 'Marko Trenerovic', 'marko@trainer.com', 'hash_trainer_123', 'sr', 'TRAINER', now()),
(3, 'Jovana Fit', 'jovana@trainer.com', 'hash_trainer_456', 'en', 'TRAINER', now()),
(4, 'Stefan Klijent', 'stefan@client.com', 'hash_client_123', 'sr', 'CLIENT', now()),
(5, 'Ana Klijent', 'ana@client.com', 'hash_client_456', 'sr', 'CLIENT', now());

INSERT INTO admins (user_id) VALUES (1);

INSERT INTO trainers (user_id, registration_status, education, bio, approved_at, created_at) VALUES
(2, 'APPROVED', 'Fakultet sporta i fizickog vaspitanja', 'Specijalista za snagu.', now(), now()),
(3, 'APPROVED', 'Kurs za personalnog trenera', 'Yoga i mobilnost.', now(), now());

INSERT INTO clients (user_id, goal, training_location, free_trial_used, created_at) VALUES
(4, 'Gubitak kilograma i definicija', 'GYM', FALSE, now()),
(5, 'Odrzavanje kondicije', 'HOME', TRUE, now());

-- =====================================================================
-- 2. CREDENTIALS & PRICING TIERS
-- =====================================================================
INSERT INTO credentials (id, trainer_id, type, file_url, issued_by, upload_date) VALUES
(1, 2, 'DIPLOMA', 'https://storage.com/diploma2.pdf', 'FSFV', '2023-01-15'),
(2, 3, 'COURSE_CERTIFICATE', 'https://storage.com/cert3.pdf', 'Yoga Alliance', '2023-05-20');

INSERT INTO pricing_tiers (id, trainer_id, sessions_per_week, monthly_price, active) VALUES
(1, 2, 3, 5000.00, TRUE),
(2, 2, 5, 8000.00, TRUE),
(3, 3, 2, 4000.00, TRUE);

-- =====================================================================
-- 3. EQUIPMENT & EXERCISES
-- =====================================================================
INSERT INTO equipment (id, name) VALUES
(1, 'Bucice'),
(2, 'Elasticna traka'),
(3, 'Prostirka za jogu'),
(4, 'Benč klupa');

INSERT INTO exercises (id, trainer_id, name, default_reps, default_sets, demo_video_url) VALUES
(1, 2, 'Benč pres', 10, 4, 'https://youtube.com/bench'),
(2, 2, 'Biceps pregib bucicama', 12, 3, 'https://youtube.com/biceps'),
(3, 3, 'Pozdrav suncu', 5, 2, 'https://youtube.com/yoga1'),
(4, 3, 'Razvlacenje trakom', 15, 3, NULL);

INSERT INTO exercise_equipment (exercise_id, equipment_id) VALUES
(1, 4),
(2, 1),
(3, 3),
(4, 2);

INSERT INTO client_equipment (client_id, equipment_id) VALUES
(5, 1),
(5, 2),
(5, 3);

-- =====================================================================
-- 4. HEALTH RECORDS
-- =====================================================================
INSERT INTO health_records (id, client_id, record_date, weight, height, health_condition) VALUES
(1, 4, '2023-10-01', 95.5, 185.0, 'Povreda desnog kolena pre 5 godina.'),
(2, 5, '2023-10-05', 65.0, 170.0, 'Nema zdravstvenih problema.');

-- =====================================================================
-- 5. COOPERATIONS & PAYMENTS
-- =====================================================================
INSERT INTO cooperations (id, trainer_id, client_id, pricing_tier_id, status, request_date, start_date, end_date, is_free_trial) VALUES
(1, 2, 4, 1, 'ACTIVE', '2023-10-01 10:00:00', '2023-10-02', '2023-11-02', FALSE),
(2, 3, 5, NULL, 'PENDING', '2023-10-10 14:30:00', NULL, NULL, TRUE);

INSERT INTO payments (id, cooperation_id, payment_date, amount) VALUES
(1, 1, '2023-10-01', 5000.00);

-- =====================================================================
-- 6. TRAININGS (Live & Assigned) & EXERCISES
-- =====================================================================
INSERT INTO trainings (id, cooperation_id, training_type, training_date, status) VALUES
(1, 1, 'LIVE', '2023-10-05', 'COMPLETED'),
(2, 1, 'ASSIGNED', '2023-10-07', 'SCHEDULED'),
(3, 1, 'LIVE', '2023-10-10', 'SCHEDULED');

INSERT INTO live_trainings (training_id, meeting_link) VALUES
(1, 'https://zoom.us/j/123456'),
(3, 'https://zoom.us/j/654321');

INSERT INTO assigned_trainings (training_id, target_date) VALUES
(2, '2023-10-07');

INSERT INTO training_exercises (id, training_id, exercise_id, assigned_reps, assigned_sets, completed, difficulty_rating, client_comment) VALUES
(1, 1, 1, 10, 4, TRUE, 4, 'Bilo je naporno, ali uspesno.'),
(2, 1, 2, 12, 3, TRUE, 3, NULL),
(3, 2, 2, 15, 3, FALSE, NULL, NULL);

-- =====================================================================
-- 7. REVIEWS & REPORTS
-- =====================================================================
INSERT INTO training_reviews (id, training_id, trainer_id, rating, comment, visible_to_other_trainers_only) VALUES
(1, 1, 3, 5, 'Klijent je imao odlicnu formu tokom celog treninga.', TRUE);

INSERT INTO trainer_reviews (id, trainer_id, client_id, rating, comment, review_date) VALUES
(1, 2, 4, 5, 'Najbolji trener! Jako stručan i posvećen.', '2023-10-15');

INSERT INTO client_reports (id, client_id, trainer_id, report_text, report_date, status) VALUES
(1, 5, 2, 'Trener mi se nepristojno obracao u porukama.', '2023-10-12 09:00:00', 'OPEN');

-- =====================================================================
-- 8. COMMUNICATIONS & NOTIFICATIONS
-- =====================================================================
INSERT INTO chat_messages (id, sender_id, receiver_id, message_text, sent_at, is_read, forwarded_via_email) VALUES
(1, 4, 2, 'Hej, da li sutra radimo noge ili grudi?', '2023-10-04 18:00:00', TRUE, FALSE),
(2, 2, 4, 'Sutra radimo grudi i ruke. Vidimo se!', '2023-10-04 18:30:00', TRUE, FALSE),
(3, 5, 3, 'Poslala sam zahtev za probni trening.', '2023-10-10 14:35:00', FALSE, TRUE);

INSERT INTO system_notifications (id, user_id, type, notif_text, sent_at, is_read) VALUES
(1, 4, 'COOPERATION_ACCEPTED', 'Vas zahtev za saradnju je prihvacen!', '2023-10-01 12:00:00', TRUE),
(2, 3, 'STATISTICS', 'Imate novi zahtev za probni trening.', '2023-10-10 14:30:00', FALSE);

-- Resinhronizacija SERIAL sekvenci kako bi buduci INSERTable radili pravilno (posle rucnog unosa ID-jeva)
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('credentials', 'id'), COALESCE(MAX(id), 1)) FROM credentials;
SELECT setval(pg_get_serial_sequence('pricing_tiers', 'id'), COALESCE(MAX(id), 1)) FROM pricing_tiers;
SELECT setval(pg_get_serial_sequence('equipment', 'id'), COALESCE(MAX(id), 1)) FROM equipment;
SELECT setval(pg_get_serial_sequence('exercises', 'id'), COALESCE(MAX(id), 1)) FROM exercises;
SELECT setval(pg_get_serial_sequence('health_records', 'id'), COALESCE(MAX(id), 1)) FROM health_records;
SELECT setval(pg_get_serial_sequence('cooperations', 'id'), COALESCE(MAX(id), 1)) FROM cooperations;
SELECT setval(pg_get_serial_sequence('payments', 'id'), COALESCE(MAX(id), 1)) FROM payments;
SELECT setval(pg_get_serial_sequence('trainings', 'id'), COALESCE(MAX(id), 1)) FROM trainings;
SELECT setval(pg_get_serial_sequence('training_exercises', 'id'), COALESCE(MAX(id), 1)) FROM training_exercises;
SELECT setval(pg_get_serial_sequence('training_reviews', 'id'), COALESCE(MAX(id), 1)) FROM training_reviews;
SELECT setval(pg_get_serial_sequence('trainer_reviews', 'id'), COALESCE(MAX(id), 1)) FROM trainer_reviews;
SELECT setval(pg_get_serial_sequence('client_reports', 'id'), COALESCE(MAX(id), 1)) FROM client_reports;
SELECT setval(pg_get_serial_sequence('chat_messages', 'id'), COALESCE(MAX(id), 1)) FROM chat_messages;
SELECT setval(pg_get_serial_sequence('system_notifications', 'id'), COALESCE(MAX(id), 1)) FROM system_notifications;

COMMIT;