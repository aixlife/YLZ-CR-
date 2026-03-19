-- ============================================
-- YLZ CRM: inquiry_type 컬럼 추가 + 파이프라인 6단계 업데이트
-- 실행 위치: Doctor Engine Supabase > SQL Editor
-- ============================================

-- 1. clients 테이블에 inquiry_type 컬럼 추가
ALTER TABLE ylz_crm.clients ADD COLUMN IF NOT EXISTS inquiry_type text;

-- 2. 시드 함수 업데이트 (6단계 파이프라인)
CREATE OR REPLACE FUNCTION ylz_crm.seed_user_defaults()
RETURNS trigger AS $$
DECLARE
  stage_names text[] := ARRAY['문의', '미팅', '계약', '계약 완료', '진행 중', '계약 연장'];
  stage_colors text[] := ARRAY['#3EA2FF', '#FF8B49', '#5E6EFF', '#FF6B9D', '#16C93D', '#995AFF'];
  cat_id uuid;
  i int;
BEGIN
  -- 파이프라인 단계 생성 (6단계)
  FOR i IN 1..6 LOOP
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

-- ============================================
-- 완료! 이 SQL 실행 후:
-- 1. 사이트에서 회원가입 (첫 가입 시 자동으로 6단계 + 태그가 생성됨)
-- 2. 로그인 후 클라이언트 등록 테스트
-- ============================================
