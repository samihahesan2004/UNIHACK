-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  first_name text,
  last_name text,
  age int,
  pronouns text,
  bio text,
  degree text,
  year_of_study text,
  avatar_url text,
  interests text[] default '{}',
  weekend_style text[] default '{}',
  music_taste text[] default '{}',
  trying_to_meet text[] default '{}',
  preferred_event_vibe text,
  conversation_style text,
  ideal_hangout text,
  fun_fact text,
  social_energy int default 3,
  created_at timestamp with time zone default now()
);

-- Events table
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  society text,
  date timestamp with time zone,
  location text,
  max_group_size int default 4,
  created_at timestamp with time zone default now()
);

-- Event attendees
create table if not exists event_attendees (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  unique(event_id, user_id)
);

-- Match groups
create table if not exists match_groups (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Match group members
create table if not exists match_group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references match_groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  unique(group_id, user_id)
);

-- RLS
alter table profiles enable row level security;
alter table events enable row level security;
alter table event_attendees enable row level security;
alter table match_groups enable row level security;
alter table match_group_members enable row level security;

create policy "Profiles viewable by everyone" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Events viewable by everyone" on events for select using (true);
create policy "Attendees viewable by everyone" on event_attendees for select using (true);
create policy "Users can join events" on event_attendees for insert with check (auth.uid() = user_id);
create policy "Users can leave events" on event_attendees for delete using (auth.uid() = user_id);
create policy "Match groups viewable by everyone" on match_groups for select using (true);
create policy "Match groups insertable" on match_groups for insert with check (auth.role() = 'authenticated');
create policy "Match group members viewable by everyone" on match_group_members for select using (true);
create policy "Match group members insertable" on match_group_members for insert with check (auth.role() = 'authenticated');

-- Seed events
insert into events (title, description, society, date, location, max_group_size) values
  ('Welcome BBQ', 'Kick off the semester with free food and new friends!', 'Student Union', now() + interval '3 days', 'Main Lawn', 4),
  ('Hackathon Kickoff', 'Form your team and start building something awesome.', 'Tech Society', now() + interval '7 days', 'Engineering Building', 3),
  ('Movie Night', 'Outdoor cinema under the stars. BYO blanket!', 'Arts Society', now() + interval '5 days', 'Amphitheatre', 4),
  ('Speed Friending', 'Meet 10 new people in 30 minutes. Low pressure, high fun.', 'Social Club', now() + interval '2 days', 'Student Lounge', 5);
