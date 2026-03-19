-- ============================================
-- YLZ CRM → Doctor Engine Supabase 스키마 분리 마이그레이션
-- 실행 위치: Doctor Engine Supabase > SQL Editor
-- 날짜: 2026-03-19
-- ============================================

-- 1. ylz_crm 스키마 생성
CREATE SCHEMA IF NOT EXISTS ylz_crm;

-- 2. 스키마에 대한 권한 부여 (Supabase 역할)
GRANT USAGE ON SCHEMA ylz_crm TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA ylz_crm TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ylz_crm TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA ylz_crm TO anon, authenticated, service_role;

-- 향후 생성되는 객체에도 자동 권한 부여
ALTER DEFAULT PRIVILEGES IN SCHEMA ylz_crm
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA ylz_crm
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA ylz_crm
  GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ============================================
-- 3. 테이블 생성 (ylz_crm 스키마)
-- ============================================

-- 3.1 사용자 프로필
CREATE TABLE ylz_crm.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ylz_crm.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON ylz_crm.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON ylz_crm.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON ylz_crm.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3.2 파이프라인 단계
CREATE TABLE ylz_crm.pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES ylz_crm.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#2C74FF',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ylz_crm.pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own stages" ON ylz_crm.pipeline_stages FOR ALL USING (auth.uid() = user_id);

-- 3.3 분류 카테고리
CREATE TABLE ylz_crm.tag_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES ylz_crm.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ylz_crm.tag_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own categories" ON ylz_crm.tag_categories FOR ALL USING (auth.uid() = user_id);

-- 3.4 분류 옵션
CREATE TABLE ylz_crm.tag_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES ylz_crm.tag_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ylz_crm.tag_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tag options" ON ylz_crm.tag_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ylz_crm.tag_categories
      WHERE ylz_crm.tag_categories.id = ylz_crm.tag_options.category_id
      AND ylz_crm.tag_categories.user_id = auth.uid()
    )
  );

-- 3.5 클라이언트
CREATE TABLE ylz_crm.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES ylz_crm.profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text,
  phone text,
  email text,
  memo text,
  stage_id uuid NOT NULL REFERENCES ylz_crm.pipeline_stages(id),
  stage_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ylz_crm.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own clients" ON ylz_crm.clients FOR ALL USING (auth.uid() = user_id);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION ylz_crm.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON ylz_crm.clients
  FOR EACH ROW EXECUTE PROCEDURE ylz_crm.update_updated_at();

-- 3.6 클라이언트-태그 연결
CREATE TABLE ylz_crm.client_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES ylz_crm.clients(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES ylz_crm.tag_options(id) ON DELETE CASCADE,
  UNIQUE(client_id, option_id)
);

ALTER TABLE ylz_crm.client_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own client tags" ON ylz_crm.client_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ylz_crm.clients
      WHERE ylz_crm.clients.id = ylz_crm.client_tags.client_id
      AND ylz_crm.clients.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. 자동 프로필 생성 + 기본 데이터 시드
-- ============================================

-- 4.1 YLZ CRM 전용 사용자 처리 함수
CREATE OR REPLACE FUNCTION ylz_crm.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO ylz_crm.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.2 auth.users에 트리거 연결
-- 주의: Doctor Engine은 auth를 사용하지 않으므로 충돌 없음
CREATE TRIGGER on_ylz_crm_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE ylz_crm.handle_new_user();

-- 4.3 기본 데이터 시드 함수
CREATE OR REPLACE FUNCTION ylz_crm.seed_user_defaults()
RETURNS trigger AS $$
DECLARE
  stage_names text[] := ARRAY['문의', '미팅', '계약', '진행 중', '계약 연장'];
  stage_colors text[] := ARRAY['#3EA2FF', '#FF8B49', '#5E6EFF', '#16C93D', '#995AFF'];
  cat_id uuid;
  i int;
BEGIN
  -- 파이프라인 단계 생성
  FOR i IN 1..5 LOOP
    INSERT INTO ylz_crm.pipeline_stages (user_id, name, display_order, color)
    VALUES (NEW.id, stage_names[i], i - 1, stage_colors[i]);
  END LOOP;

  -- 서비스 유형
  INSERT INTO ylz_crm.tag_categories (user_id, name, display_order)
  VALUES (NEW.id, '서비스 유형', 0) RETURNING id INTO cat_id;
  INSERT INTO ylz_crm.tag_options (category_id, name, display_order) VALUES
    (cat_id, '챌린지', 0), (cat_id, '코칭', 1), (cat_id, '컨설팅', 2), (cat_id, '대행', 3);

  -- 규모
  INSERT INTO ylz_crm.tag_categories (user_id, name, display_order)
  VALUES (NEW.id, '규모', 1) RETURNING id INTO cat_id;
  INSERT INTO ylz_crm.tag_options (category_id, name, display_order) VALUES
    (cat_id, '소기업', 0), (cat_id, '중견기업', 1), (cat_id, '대기업', 2);

  -- 계약 기간
  INSERT INTO ylz_crm.tag_categories (user_id, name, display_order)
  VALUES (NEW.id, '계약 기간', 2) RETURNING id INTO cat_id;
  INSERT INTO ylz_crm.tag_options (category_id, name, display_order) VALUES
    (cat_id, '1개월', 0), (cat_id, '3개월', 1), (cat_id, '1년', 2);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ylz_crm_profile_created
  AFTER INSERT ON ylz_crm.profiles
  FOR EACH ROW EXECUTE PROCEDURE ylz_crm.seed_user_defaults();

-- ============================================
-- 5. Supabase API에 ylz_crm 스키마 노출
-- ============================================
-- Supabase Dashboard > Settings > API > Exposed schemas에
-- "ylz_crm"을 추가해야 합니다 (수동 작업 필요)
--
-- 또는 아래 SQL로 설정:
NOTIFY pgrst, 'reload config';
COMMENT ON SCHEMA ylz_crm IS 'YLZ CRM 전용 스키마 - Supabase API 노출 필요';

-- ============================================
-- 완료! 다음 단계:
-- 1. Supabase Dashboard > Settings > API > Exposed schemas에 "ylz_crm" 추가
-- 2. YLZ CRM 코드에서 Supabase 클라이언트에 db: { schema: 'ylz_crm' } 옵션 추가
-- 3. YLZ CRM의 환경변수를 Doctor Engine Supabase URL/Key로 변경
-- ============================================
