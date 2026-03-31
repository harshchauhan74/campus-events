-- Campus Event Aggregator: Full Database Setup
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/bolnavzjrwjutneezrtc/sql

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'user',
  avatar text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  end_date date,
  time text NOT NULL,
  end_time text,
  location text NOT NULL,
  latitude double precision,
  longitude double precision,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  image text,
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organizer_name text NOT NULL,
  registration_link text,
  is_featured boolean NOT NULL DEFAULT false,
  rsvp_count integer NOT NULL DEFAULT 0,
  capacity integer,
  is_virtual boolean NOT NULL DEFAULT false,
  virtual_link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. RSVPs table
CREATE TABLE IF NOT EXISTS rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- 4. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_avatar text,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies - Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Anyone can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- 7. RLS Policies - Events
CREATE POLICY "Approved events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Organizers can update own events" ON events
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete events" ON events
  FOR DELETE USING (true);

-- 8. RLS Policies - RSVPs
CREATE POLICY "RSVPs are viewable by everyone" ON rsvps
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can RSVP" ON rsvps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can remove own RSVP" ON rsvps
  FOR DELETE USING (true);

-- 9. RLS Policies - Reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- 10. Function to auto-update RSVP count
CREATE OR REPLACE FUNCTION update_rsvp_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events SET rsvp_count = GREATEST(0, rsvp_count - 1) WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_rsvp_change
  AFTER INSERT OR DELETE ON rsvps
  FOR EACH ROW EXECUTE FUNCTION update_rsvp_count();

-- 11. Seed data: Profiles
INSERT INTO profiles (id, name, email, role, avatar, created_at) VALUES
  ('a1b2c3d4-0001-4000-a000-000000000001', 'Alex Rivera', 'alex.rivera@university.edu', 'admin', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', '2025-08-15T10:00:00Z'),
  ('a1b2c3d4-0001-4000-a000-000000000002', 'Jordan Chen', 'jordan.chen@university.edu', 'organizer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', '2025-09-01T10:00:00Z'),
  ('a1b2c3d4-0001-4000-a000-000000000003', 'Sam Patel', 'sam.patel@university.edu', 'organizer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', '2025-09-10T10:00:00Z'),
  ('a1b2c3d4-0001-4000-a000-000000000004', 'Taylor Kim', 'taylor.kim@university.edu', 'user', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', '2025-10-01T10:00:00Z'),
  ('a1b2c3d4-0001-4000-a000-000000000005', 'Morgan Davis', 'morgan.davis@university.edu', 'user', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', '2025-10-05T10:00:00Z'),
  ('a1b2c3d4-0001-4000-a000-000000000006', 'Casey Williams', 'casey.williams@university.edu', 'user', NULL, '2025-10-10T10:00:00Z')
ON CONFLICT (email) DO NOTHING;

-- 12. Seed data: Events
INSERT INTO events (id, title, description, date, end_date, time, end_time, location, latitude, longitude, category, status, image, organizer_id, organizer_name, registration_link, is_featured, rsvp_count, capacity, created_at) VALUES
  ('b1b2c3d4-0001-4000-b000-000000000001', 'Spring Hackathon 2026', 'Join us for a 48-hour coding marathon! Build innovative solutions to real-world campus problems. Teams of 2-5 welcome. Prizes include $2,000 in cash, mentorship sessions, and internship opportunities with our industry partners. Food and drinks provided throughout the event.', '2026-04-05', '2026-04-07', '18:00', '18:00', 'Engineering Building, Room 301', 40.7128, -74.006, 'tech', 'approved', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000002', 'Jordan Chen', 'https://hackathon.university.edu', true, 142, 200, '2026-02-15T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000002', 'Guest Lecture: Future of Renewable Energy', 'Dr. Elena Vasquez from MIT will present her groundbreaking research on next-generation solar cells and their potential to transform global energy infrastructure. Q&A session to follow. Open to all departments.', '2026-04-02', NULL, '14:00', '16:00', 'Whitmore Auditorium', 40.7145, -74.0075, 'academic', 'approved', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000003', 'Sam Patel', NULL, true, 89, 300, '2026-02-20T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000003', 'Intramural Basketball Tournament', 'The spring intramural basketball season kicks off with our annual tournament. Register your team of 5 players and compete for the campus championship trophy.', '2026-04-12', '2026-04-13', '09:00', '20:00', 'Campus Recreation Center', 40.711, -74.005, 'sports', 'approved', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000002', 'Jordan Chen', NULL, true, 64, 120, '2026-03-01T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000004', 'Spring Music Festival', 'An evening of live performances featuring student bands, solo artists, and a special surprise guest headliner. Food trucks, art installations, and late-night DJ sets.', '2026-04-19', NULL, '16:00', '23:00', 'Main Quad Outdoor Stage', 40.7135, -74.0065, 'social', 'approved', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000003', 'Sam Patel', NULL, true, 312, 500, '2026-03-05T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000005', 'Career Fair: Tech & Engineering', 'Connect with 40+ top employers including Google, Microsoft, SpaceX, and local startups. Bring your resume and dress professionally.', '2026-04-08', NULL, '10:00', '16:00', 'Student Union Ballroom', 40.7138, -74.008, 'career', 'approved', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000002', 'Jordan Chen', 'https://career.university.edu/fair', true, 203, 400, '2026-03-08T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000006', 'Yoga & Meditation Workshop', 'De-stress before midterms with our guided yoga and meditation session. Suitable for all experience levels. Mats provided.', '2026-03-31', NULL, '07:00', '08:30', 'Wellness Center, Studio B', 40.715, -74.004, 'health', 'approved', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000003', 'Sam Patel', NULL, false, 35, 40, '2026-03-10T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000007', 'Student Art Exhibition Opening', 'Celebrating the creative talents of our Fine Arts students. Over 60 works spanning painting, sculpture, digital art, and photography.', '2026-04-15', NULL, '18:00', '21:00', 'Campus Gallery, Arts Building', 40.712, -74.009, 'arts', 'approved', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000002', 'Jordan Chen', NULL, false, 78, 150, '2026-03-12T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000008', 'Debate Club: AI Ethics Forum', 'Should AI systems be regulated like pharmaceuticals? Join our Oxford-style debate with faculty moderators.', '2026-04-03', NULL, '19:00', '21:00', 'Philosophy Hall, Room 110', 40.7142, -74.0055, 'clubs', 'approved', 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000003', 'Sam Patel', NULL, false, 52, NULL, '2026-03-14T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000009', 'Machine Learning Workshop Series', 'A four-session hands-on workshop covering fundamentals of machine learning using Python and TensorFlow.', '2026-04-10', NULL, '15:00', '17:00', 'Computer Science Lab 204', 40.7125, -74.0068, 'tech', 'approved', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000002', 'Jordan Chen', NULL, false, 95, 100, '2026-03-15T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000010', '5K Fun Run for Charity', 'Lace up your running shoes for our annual charity 5K! All proceeds go to the local children''s hospital. Walkers welcome.', '2026-04-20', NULL, '08:00', '11:00', 'Campus Track & Field', 40.7108, -74.0042, 'sports', 'approved', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000003', 'Sam Patel', 'https://run.university.edu', false, 156, 300, '2026-03-16T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000011', 'International Food Festival', 'Taste cuisines from around the world! Student cultural organizations will prepare authentic dishes from over 20 countries.', '2026-04-22', NULL, '11:00', '17:00', 'Student Center Plaza', 40.7132, -74.0072, 'social', 'approved', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000002', 'Jordan Chen', NULL, false, 245, 500, '2026-03-18T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000012', 'Resume Workshop & LinkedIn Bootcamp', 'Get your resume reviewed by HR professionals and learn how to optimize your LinkedIn profile.', '2026-04-01', NULL, '13:00', '17:00', 'Career Services Center', 40.714, -74.006, 'career', 'approved', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000003', 'Sam Patel', NULL, false, 67, 80, '2026-03-19T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000013', 'Creative Writing Open Mic Night', 'Share your poetry, short fiction, or personal essays in a supportive and encouraging environment.', '2026-04-17', NULL, '19:30', '22:00', 'Campus Coffee House', 40.7148, -74.0058, 'arts', 'approved', 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000002', 'Jordan Chen', NULL, false, 41, NULL, '2026-03-20T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000014', 'Mental Health Awareness Panel', 'Campus counselors and student advocates discuss recognizing burnout, managing academic stress, and accessing campus mental health resources.', '2026-04-09', NULL, '16:00', '18:00', 'Student Wellness Auditorium', 40.7152, -74.0048, 'health', 'approved', 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000003', 'Sam Patel', NULL, false, 88, 200, '2026-03-21T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000015', 'Robotics Club Showcase', 'Watch autonomous robots compete in obstacle courses and see the latest projects from our engineering students.', '2026-04-25', NULL, '13:00', '17:00', 'Engineering Atrium', 40.7129, -74.0063, 'clubs', 'approved', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000002', 'Jordan Chen', NULL, false, 73, 150, '2026-03-22T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000016', 'Study Abroad Info Session', 'Learn about semester and summer study abroad programs in 30+ countries.', '2026-04-04', NULL, '12:00', '13:30', 'International Center, Room 205', 40.7136, -74.0082, 'academic', 'approved', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000003', 'Sam Patel', NULL, false, 54, 80, '2026-03-23T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000017', 'Late Night Board Game Social', 'Bring your favorite board games or try new ones! Snacks and beverages provided.', '2026-04-11', NULL, '20:00', '23:59', 'Residence Hall Commons', 40.7118, -74.0055, 'social', 'pending', 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000004', 'Taylor Kim', NULL, false, 0, NULL, '2026-03-25T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000018', 'Photography Workshop: Portrait Basics', 'Learn the fundamentals of portrait photography including lighting, composition, and posing.', '2026-04-14', NULL, '14:00', '16:00', 'Arts Building, Studio 102', 40.712, -74.009, 'arts', 'pending', 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000005', 'Morgan Davis', NULL, false, 0, NULL, '2026-03-26T10:00:00Z'),
  ('b1b2c3d4-0001-4000-b000-000000000019', 'Startup Pitch Competition', 'Got a startup idea? Pitch it to a panel of investors and entrepreneurs for a chance to win seed funding.', '2026-04-28', NULL, '17:00', '21:00', 'Business School Auditorium', 40.7145, -74.007, 'career', 'pending', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=500&fit=crop', 'a1b2c3d4-0001-4000-a000-000000000004', 'Taylor Kim', 'https://startup.university.edu', false, 0, 200, '2026-03-27T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 13. Seed data: RSVPs
INSERT INTO rsvps (user_id, event_id) VALUES
  ('a1b2c3d4-0001-4000-a000-000000000004', 'b1b2c3d4-0001-4000-b000-000000000001'),
  ('a1b2c3d4-0001-4000-a000-000000000004', 'b1b2c3d4-0001-4000-b000-000000000004'),
  ('a1b2c3d4-0001-4000-a000-000000000004', 'b1b2c3d4-0001-4000-b000-000000000005'),
  ('a1b2c3d4-0001-4000-a000-000000000005', 'b1b2c3d4-0001-4000-b000-000000000001'),
  ('a1b2c3d4-0001-4000-a000-000000000005', 'b1b2c3d4-0001-4000-b000-000000000002'),
  ('a1b2c3d4-0001-4000-a000-000000000005', 'b1b2c3d4-0001-4000-b000-000000000009'),
  ('a1b2c3d4-0001-4000-a000-000000000006', 'b1b2c3d4-0001-4000-b000-000000000003'),
  ('a1b2c3d4-0001-4000-a000-000000000006', 'b1b2c3d4-0001-4000-b000-000000000004'),
  ('a1b2c3d4-0001-4000-a000-000000000006', 'b1b2c3d4-0001-4000-b000-000000000011')
ON CONFLICT (user_id, event_id) DO NOTHING;

-- 14. Seed data: Reviews
INSERT INTO reviews (user_id, user_name, user_avatar, event_id, rating, comment, created_at) VALUES
  ('a1b2c3d4-0001-4000-a000-000000000004', 'Taylor Kim', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', 'b1b2c3d4-0001-4000-b000-000000000006', 5, 'Exactly what I needed before midterms. The instructor was so calming and the guided meditation really helped me reset.', '2026-03-31T09:00:00Z'),
  ('a1b2c3d4-0001-4000-a000-000000000005', 'Morgan Davis', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', 'b1b2c3d4-0001-4000-b000-000000000012', 4, 'Great feedback on my resume. The LinkedIn tips were particularly valuable. Wish the individual sessions were a bit longer.', '2026-04-01T18:00:00Z'),
  ('a1b2c3d4-0001-4000-a000-000000000006', 'Casey Williams', NULL, 'b1b2c3d4-0001-4000-b000-000000000012', 5, 'The HR professionals were incredibly helpful! Got three specific suggestions that completely transformed my resume.', '2026-04-01T18:30:00Z'),
  ('a1b2c3d4-0001-4000-a000-000000000004', 'Taylor Kim', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', 'b1b2c3d4-0001-4000-b000-000000000002', 5, 'Dr. Vasquez''s presentation was mind-blowing. The Q&A was the best part.', '2026-04-02T17:00:00Z'),
  ('a1b2c3d4-0001-4000-a000-000000000005', 'Morgan Davis', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', 'b1b2c3d4-0001-4000-b000-000000000008', 4, 'Fascinating debate on AI ethics. Both sides presented compelling arguments.', '2026-04-03T22:00:00Z')
ON CONFLICT DO NOTHING;
