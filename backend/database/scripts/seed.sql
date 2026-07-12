BEGIN;

-- =====================================================================
-- 1. USERS (Shared Base)
-- =====================================================================
INSERT INTO users (id, name, email, password_hash, language, role) VALUES
-- Admin
('10000000-0000-0000-0000-000000000001', 'Marko Marković', 'admin@fitconnect.rs', '$2a$12$e8...hashedpass1', 'sr', 'ADMIN'),
-- Trainers
('20000000-0000-0000-0000-000000000001', 'Nikola Petrović', 'nikola.trener@gmail.com', '$2a$12$e8...hashedpass2', 'sr', 'TRAINER'),
('20000000-0000-0000-0000-000000000002', 'Jelena Jović', 'jelena.fit@gmail.com', '$2a$12$e8...hashedpass3', 'sr', 'TRAINER'),
-- Clients
('30000000-0000-0000-0000-000000000001', 'Stefan Stanković', 'stefan.klijent@gmail.com', '$2a$12$e8...hashedpass4', 'sr', 'CLIENT'),
('30000000-0000-0000-0000-000000000002', 'Ana Anić', 'ana.anic@gmail.com', '$2a$12$e8...hashedpass5', 'sr', 'CLIENT');

-- =====================================================================
-- 2. USER SUBTYPES (Admins, Trainers, Clients)
-- =====================================================================
INSERT INTO admins (user_id) VALUES 
('10000000-0000-0000-0000-000000000001');

INSERT INTO trainers (user_id, registration_status, education, bio, approved_at) VALUES
('20000000-0000-0000-0000-000000000001', 'APPROVED', 'Fakultet sporta i fizičkog vaspitanja, Beograd', 'Sertifikovani personalni trener sa preko 5 godina iskustva u hipertrofiji i kondiciji.', now() - INTERVAL '30 days'),
('20000000-0000-0000-0000-000000000002', 'APPROVED', 'FISAF International', 'Specijalizovana za funkcionalni trening, pilates i rehabilitaciju.', now() - INTERVAL '15 days');
 
INSERT INTO clients (user_id, goal, training_location, free_trial_used) VALUES
('30000000-0000-0000-0000-000000000001', 'Povećanje mišićne mase i snage.', 'GYM', TRUE),
('30000000-0000-0000-0000-000000000002', 'Redukcija telesne mase i poboljšanje kondicije.', 'HOME', FALSE);

-- =====================================================================
-- 3. CREDENTIALS & PRICING TIERS
-- =====================================================================
INSERT INTO credentials (id, trainer_id, type, file_url, issued_by, upload_date) VALUES
('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'DIPLOMA', 'https://storage.fitconnect.rs/docs/diploma_nikola.pdf', 'FSFV Beograd', '2023-06-15'),
('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'LICENSE', 'https://storage.fitconnect.rs/docs/licenca_jelena.pdf', 'FISAF Srbija', '2024-01-10');

INSERT INTO pricing_tiers (id, trainer_id, sessions_per_week, monthly_price, active) VALUES
('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 3, 15000.00, TRUE),
('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 4, 18000.00, TRUE),
('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 2, 12000.00, TRUE);

-- =====================================================================
-- 4. EQUIPMENT & EXERCISES
-- =====================================================================
INSERT INTO equipment (id, name) VALUES
('60000000-0000-0000-0000-000000000001', 'Bučice (Dumbbells)'),
('60000000-0000-0000-0000-000000000002', 'Olimpijska šipka i tegovi'),
('60000000-0000-0000-0000-000000000003', 'Klupa za benč'),
('60000000-0000-0000-0000-000000000004', 'Elastične trake (Resistance Bands)'),
('60000000-0000-0000-0000-000000000005', 'Prostirka za vežbanje');

INSERT INTO client_equipment (client_id, equipment_id) VALUES
('30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000004'),
('30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000005');

INSERT INTO exercises (id, trainer_id, name, default_reps, default_sets, demo_video_url) VALUES
('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Benč pres (Flat Bench Press)', 8, 4, 'https://youtube.com/watch?v=demo1'),
('70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Čučanj sa šipkom (Barbell Squat)', 6, 4, 'https://youtube.com/watch?v=demo2'),
('70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'Goblet čučanj sa bučicom', 12, 3, 'https://youtube.com/watch?v=demo3'),
('70000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'Glute Bridge sa elastičnom trakom', 15, 3, 'https://youtube.com/watch?v=demo4');

INSERT INTO exercise_equipment (exercise_id, equipment_id) VALUES
('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002'),
('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003'),
('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002'),
('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000001'),
('70000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000004'),
('70000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000005');

-- =====================================================================
-- 5. HEALTH RECORDS
-- =====================================================================
INSERT INTO health_records (client_id, record_date, weight, height, health_condition) VALUES
('30000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '10 days', 82.5, 185.0, 'Nema hroničnih oboljenja. Lakša povreda levog zgloba pre 2 godine.'),
('30000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '5 days', 68.0, 168.0, 'Astma pri naporu, preporučeno izbegavanje preintenzivnog kardia.');

-- =====================================================================
-- 6. COOPERATIONS & PAYMENTS
-- =====================================================================
INSERT INTO cooperations (id, trainer_id, client_id, pricing_tier_id, status, request_date, start_date, end_date, is_free_trial) VALUES
-- Active paid cooperation for Stefan
('80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'ACTIVE', now() - INTERVAL '15 days', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '16 days', FALSE),
-- Pending free trial request for Ana
('80000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', NULL, 'PENDING', now() - INTERVAL '1 day', NULL, NULL, TRUE);

INSERT INTO payments (cooperation_id, payment_date, amount) VALUES
('80000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '14 days', 15000.00);

-- =====================================================================
-- 7. TRAININGS HIERARCHY
-- =====================================================================
INSERT INTO trainings (id, cooperation_id, training_type, training_date, status) VALUES
-- Completed live training
('90000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'LIVE', CURRENT_DATE - INTERVAL '2 days', 'COMPLETED'),
-- Scheduled assigned training for tomorrow
('90000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', 'ASSIGNED', CURRENT_DATE + INTERVAL '1 day', 'SCHEDULED');

INSERT INTO live_trainings (training_id, meeting_link) VALUES
('90000000-0000-0000-0000-000000000001', 'https://meet.google.com/abc-defg-hij');

INSERT INTO assigned_trainings (training_id, target_date) VALUES
('90000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '1 day');

INSERT INTO training_exercises (training_id, exercise_id, assigned_reps, assigned_sets, completed, difficulty_rating, client_comment) VALUES
('90000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 8, 4, TRUE, 4, 'Zadnje dve ponavljanja u 4. seriji su bila baš teška.'),
('90000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 6, 4, TRUE, 3, 'Odličan osećaj, forma stabilna.'),
('90000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 8, 4, FALSE, NULL, NULL);

-- =====================================================================
-- 8. REVIEWS & REPORTS
-- =====================================================================
INSERT INTO training_reviews (training_id, trainer_id, rating, comment, visible_to_other_trainers_only) VALUES
('90000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 5, 'Klijent je odlično napredovao sa kilažom na benču. Obratiti pažnju na mobilnost kukova pri čučnju sledeći put.', TRUE);

INSERT INTO trainer_reviews (trainer_id, client_id, rating, comment, review_date) VALUES
('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 5, 'Nikola je izuzetno posvećen i profesionalan. Trening plan je odlično prilagođen mojim ciljevima!', CURRENT_DATE - INTERVAL '1 day');

-- =====================================================================
-- 9. MESSAGES & NOTIFICATIONS
-- =====================================================================
INSERT INTO chat_messages (sender_id, receiver_id, message_text, sent_at, is_read) VALUES
('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Ćao Stefane, uneo sam plan treninga za sutra. Pogledaj kad stigneš!', now() - INTERVAL '3 hours', TRUE),
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Video sam, sve je jasno. Vidimo se sutra!', now() - INTERVAL '2 hours', TRUE);

INSERT INTO system_notifications (user_id, type, notif_text, sent_at, is_read) VALUES
('30000000-0000-0000-0000-000000000001', 'COOPERATION_ACCEPTED', 'Trener Nikola Petrović je prihvatio vaš zahtev za saradnju.', now() - INTERVAL '14 days', TRUE),
('20000000-0000-0000-0000-000000000002', 'COOPERATION_ACCEPTED', 'Imate novi zahtev za probni trening od korisnika Ana Anić.', now() - INTERVAL '1 day', FALSE);

COMMIT;