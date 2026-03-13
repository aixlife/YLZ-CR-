-- YLZ CRM Database Schema
-- Supabase Dashboard > SQL Editor에서 실행

-- 1. 사용자 프로필
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- 프로필 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. 파이프라인 단계
create table pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  display_order int not null default 0,
  color text not null default '#2C74FF',
  created_at timestamptz default now()
);

alter table pipeline_stages enable row level security;
create policy "Users can manage own stages" on pipeline_stages for all using (auth.uid() = user_id);

-- 3. 분류 카테고리
create table tag_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  display_order int not null default 0,
  created_at timestamptz default now()
);

alter table tag_categories enable row level security;
create policy "Users can manage own categories" on tag_categories for all using (auth.uid() = user_id);

-- 4. 분류 옵션
create table tag_options (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references tag_categories(id) on delete cascade,
  name text not null,
  display_order int not null default 0,
  created_at timestamptz default now()
);

alter table tag_options enable row level security;
create policy "Users can manage own tag options" on tag_options
  for all using (
    exists (
      select 1 from tag_categories
      where tag_categories.id = tag_options.category_id
      and tag_categories.user_id = auth.uid()
    )
  );

-- 5. 클라이언트
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  company_name text not null,
  contact_name text,
  phone text,
  email text,
  memo text,
  stage_id uuid not null references pipeline_stages(id),
  stage_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table clients enable row level security;
create policy "Users can manage own clients" on clients for all using (auth.uid() = user_id);

-- updated_at 자동 갱신
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at
  before update on clients
  for each row execute procedure update_updated_at();

-- 6. 클라이언트-태그 연결
create table client_tags (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  option_id uuid not null references tag_options(id) on delete cascade,
  unique(client_id, option_id)
);

alter table client_tags enable row level security;
create policy "Users can manage own client tags" on client_tags
  for all using (
    exists (
      select 1 from clients
      where clients.id = client_tags.client_id
      and clients.user_id = auth.uid()
    )
  );

-- 7. 기본 데이터 시드 함수 (회원가입 시 호출)
create or replace function public.seed_user_defaults()
returns trigger as $$
declare
  stage_names text[] := array['문의', '미팅', '계약', '진행 중', '계약 연장'];
  stage_colors text[] := array['#3EA2FF', '#FF8B49', '#5E6EFF', '#16C93D', '#995AFF'];
  cat_id uuid;
  i int;
begin
  -- 파이프라인 단계 생성
  for i in 1..5 loop
    insert into pipeline_stages (user_id, name, display_order, color)
    values (new.id, stage_names[i], i - 1, stage_colors[i]);
  end loop;

  -- 서비스 유형
  insert into tag_categories (user_id, name, display_order)
  values (new.id, '서비스 유형', 0) returning id into cat_id;
  insert into tag_options (category_id, name, display_order) values
    (cat_id, '챌린지', 0), (cat_id, '코칭', 1), (cat_id, '컨설팅', 2), (cat_id, '대행', 3);

  -- 규모
  insert into tag_categories (user_id, name, display_order)
  values (new.id, '규모', 1) returning id into cat_id;
  insert into tag_options (category_id, name, display_order) values
    (cat_id, '소기업', 0), (cat_id, '중견기업', 1), (cat_id, '대기업', 2);

  -- 계약 기간
  insert into tag_categories (user_id, name, display_order)
  values (new.id, '계약 기간', 2) returning id into cat_id;
  insert into tag_options (category_id, name, display_order) values
    (cat_id, '1개월', 0), (cat_id, '3개월', 1), (cat_id, '1년', 2);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on profiles
  for each row execute procedure public.seed_user_defaults();
