-- Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    group_name TEXT DEFAULT 'Grup A' NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Players Table (For top scores)
CREATE TABLE IF NOT EXISTS public.players (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    goals INTEGER DEFAULT 0 NOT NULL,
    yellow_cards INTEGER DEFAULT 0 NOT NULL,
    red_cards INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
    id SERIAL PRIMARY KEY,
    home_team_id INTEGER REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    away_team_id INTEGER REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'ongoing', 'finished')),
    group_name TEXT DEFAULT 'Grup A' NOT NULL,
    round TEXT DEFAULT 'Penyisihan' NOT NULL CHECK (round IN ('Penyisihan', 'Perempat Final', 'Semi Final', 'Perebutan Juara 3', 'Final')),
    player_goals JSONB DEFAULT '{}'::jsonb NOT NULL,
    player_yellow_cards JSONB DEFAULT '{}'::jsonb NOT NULL,
    player_red_cards JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Policies for public reading
CREATE POLICY "Allow public read on teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public read on players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public read on matches" ON public.matches FOR SELECT USING (true);

-- Policies for authenticated admin write operations
CREATE POLICY "Allow authenticated insert on teams" ON public.teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on teams" ON public.teams FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on teams" ON public.teams FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on players" ON public.players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on players" ON public.players FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on players" ON public.players FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on matches" ON public.matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on matches" ON public.matches FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on matches" ON public.matches FOR DELETE USING (auth.role() = 'authenticated');
