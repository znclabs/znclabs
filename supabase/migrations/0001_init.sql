-- ZNC Labs schema: shared by media (public) and studio (private) apps.
create extension if not exists pgcrypto;

create table sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  feed_url text not null unique,
  category text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table raw_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  guid text not null,
  title text not null,
  link text not null,
  summary text,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  status text not null default 'pending', -- pending | processed | skipped | failed
  unique (source_id, guid)
);

create table articles (
  id uuid primary key default gen_random_uuid(),
  raw_item_id uuid unique references raw_items(id) on delete set null,
  title text not null,
  slug text not null unique,
  body_markdown text not null,
  category text not null,
  source_name text not null,
  source_url text not null,
  model_used text not null,
  status text not null default 'published', -- draft | published
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create index articles_status_published_at_idx on articles (status, published_at desc);
create index articles_category_idx on articles (category);
create index raw_items_status_idx on raw_items (status);

create table images (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  variant text not null, -- 'square' (1080x1080) | 'portrait' (1080x1350)
  prompt text not null,
  storage_path text not null,
  public_url text not null,
  status text not null default 'generated',
  created_at timestamptz not null default now(),
  unique (article_id, variant)
);

-- Row Level Security: only published articles are readable by the public
-- (anon) key. Every other table (sources, raw_items, images, and drafts)
-- is reachable only through the service-role key used server-side by the
-- media cron route and by studio.
alter table sources enable row level security;
alter table raw_items enable row level security;
alter table articles enable row level security;
alter table images enable row level security;

create policy "public read published articles"
  on articles for select
  using (status = 'published');

-- public Storage bucket for studio-generated social images
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "public read images bucket"
  on storage.objects for select
  using (bucket_id = 'images');

-- seed sources: genel gundem + teknoloji + ekonomi
insert into sources (name, feed_url, category) values
  ('BBC News - Home', 'https://feeds.bbci.co.uk/news/rss.xml', 'gundem'),
  ('NPR News', 'https://feeds.npr.org/1001/rss.xml', 'gundem'),
  ('TechCrunch', 'https://techcrunch.com/feed/', 'teknoloji'),
  ('Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index', 'teknoloji'),
  ('Reuters Business', 'https://feeds.reuters.com/reuters/businessNews', 'ekonomi'),
  ('Financial Times - Home', 'https://www.ft.com/rss/home', 'ekonomi')
on conflict (feed_url) do nothing;
