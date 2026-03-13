/**
 * 🔴 더미데이터 모듈 — DB 연결 시 이 파일 전체 삭제
 *
 * Supabase 미연결 상태에서 UI 확인용 더미데이터입니다.
 * DB 연결 후 이 파일을 삭제하고, 각 페이지의 getDummy* import를 제거하세요.
 */

import type {
  PipelineStage,
  TagCategory,
  TagOption,
  Client,
  ClientTag,
} from "@/types";

// ── Pipeline Stages ──────────────────────────────────────────────

export const DUMMY_STAGES: PipelineStage[] = [
  {
    id: "stage-1",
    user_id: "user-1",
    name: "문의",
    display_order: 0,
    color: "#3EA2FF",
    created_at: "2026-01-15T09:00:00Z",
  },
  {
    id: "stage-2",
    user_id: "user-1",
    name: "미팅",
    display_order: 1,
    color: "#FF8B49",
    created_at: "2026-01-15T09:00:00Z",
  },
  {
    id: "stage-3",
    user_id: "user-1",
    name: "계약",
    display_order: 2,
    color: "#5E6EFF",
    created_at: "2026-01-15T09:00:00Z",
  },
  {
    id: "stage-4",
    user_id: "user-1",
    name: "진행 중",
    display_order: 3,
    color: "#16C93D",
    created_at: "2026-01-15T09:00:00Z",
  },
  {
    id: "stage-5",
    user_id: "user-1",
    name: "계약 연장",
    display_order: 4,
    color: "#995AFF",
    created_at: "2026-01-15T09:00:00Z",
  },
];

// ── Tag Categories & Options ─────────────────────────────────────

export const DUMMY_TAG_OPTIONS: TagOption[] = [
  // 서비스 유형
  { id: "opt-1", category_id: "cat-1", name: "챌린지", display_order: 0, created_at: "2026-01-15T09:00:00Z" },
  { id: "opt-2", category_id: "cat-1", name: "코칭", display_order: 1, created_at: "2026-01-15T09:00:00Z" },
  { id: "opt-3", category_id: "cat-1", name: "컨설팅", display_order: 2, created_at: "2026-01-15T09:00:00Z" },
  { id: "opt-4", category_id: "cat-1", name: "대행", display_order: 3, created_at: "2026-01-15T09:00:00Z" },
  // 규모
  { id: "opt-5", category_id: "cat-2", name: "소기업", display_order: 0, created_at: "2026-01-15T09:00:00Z" },
  { id: "opt-6", category_id: "cat-2", name: "중견기업", display_order: 1, created_at: "2026-01-15T09:00:00Z" },
  { id: "opt-7", category_id: "cat-2", name: "대기업", display_order: 2, created_at: "2026-01-15T09:00:00Z" },
  // 계약 기간
  { id: "opt-8", category_id: "cat-3", name: "1개월", display_order: 0, created_at: "2026-01-15T09:00:00Z" },
  { id: "opt-9", category_id: "cat-3", name: "3개월", display_order: 1, created_at: "2026-01-15T09:00:00Z" },
  { id: "opt-10", category_id: "cat-3", name: "1년", display_order: 2, created_at: "2026-01-15T09:00:00Z" },
];

export const DUMMY_TAG_CATEGORIES: (TagCategory & { options: TagOption[] })[] = [
  {
    id: "cat-1",
    user_id: "user-1",
    name: "서비스 유형",
    display_order: 0,
    created_at: "2026-01-15T09:00:00Z",
    options: DUMMY_TAG_OPTIONS.filter((o) => o.category_id === "cat-1"),
  },
  {
    id: "cat-2",
    user_id: "user-1",
    name: "규모",
    display_order: 1,
    created_at: "2026-01-15T09:00:00Z",
    options: DUMMY_TAG_OPTIONS.filter((o) => o.category_id === "cat-2"),
  },
  {
    id: "cat-3",
    user_id: "user-1",
    name: "계약 기간",
    display_order: 2,
    created_at: "2026-01-15T09:00:00Z",
    options: DUMMY_TAG_OPTIONS.filter((o) => o.category_id === "cat-3"),
  },
];

// ── Helper: create tag join objects ──────────────────────────────

function makeTag(
  id: string,
  clientId: string,
  optionId: string
): ClientTag & { option: TagOption & { category: TagCategory } } {
  const option = DUMMY_TAG_OPTIONS.find((o) => o.id === optionId)!;
  const category = DUMMY_TAG_CATEGORIES.find((c) => c.id === option.category_id)!;
  const { options: _, ...categoryWithoutOptions } = category;
  return {
    id,
    client_id: clientId,
    option_id: optionId,
    option: { ...option, category: categoryWithoutOptions },
  };
}

// ── Clients (레퍼런스 이미지 기반 풍부한 데이터) ─────────────────

export const DUMMY_CLIENTS: Client[] = [
  // 문의 단계 (3명)
  {
    id: "client-1",
    user_id: "user-1",
    company_name: "블루웨이브 디자인",
    contact_name: "김서연",
    phone: "010-2345-6789",
    email: "sy.kim@bluewave.kr",
    memo: "인스타그램 DM으로 문의. 브랜딩 리뉴얼 관심.",
    stage_id: "stage-1",
    stage_order: 0,
    created_at: "2026-03-10T14:30:00Z",
    updated_at: "2026-03-10T14:30:00Z",
    stage: DUMMY_STAGES[0],
    tags: [
      makeTag("ct-1", "client-1", "opt-3"),
      makeTag("ct-2", "client-1", "opt-5"),
    ],
  },
  {
    id: "client-2",
    user_id: "user-1",
    company_name: "넥스트핏 코리아",
    contact_name: "박준혁",
    phone: "010-8877-1234",
    email: "jh.park@nextfit.co.kr",
    memo: "헬스케어 앱 마케팅 대행 문의. 예산 확인 필요.",
    stage_id: "stage-1",
    stage_order: 1,
    created_at: "2026-03-09T10:00:00Z",
    updated_at: "2026-03-09T10:00:00Z",
    stage: DUMMY_STAGES[0],
    tags: [
      makeTag("ct-3", "client-2", "opt-4"),
      makeTag("ct-4", "client-2", "opt-6"),
      makeTag("ct-5", "client-2", "opt-9"),
    ],
  },
  {
    id: "client-3",
    user_id: "user-1",
    company_name: "모던리빙 인테리어",
    contact_name: "이하은",
    phone: "010-5544-3322",
    email: "haeun@modernliving.kr",
    memo: null,
    stage_id: "stage-1",
    stage_order: 2,
    created_at: "2026-03-08T16:45:00Z",
    updated_at: "2026-03-08T16:45:00Z",
    stage: DUMMY_STAGES[0],
    tags: [
      makeTag("ct-6", "client-3", "opt-3"),
      makeTag("ct-7", "client-3", "opt-5"),
    ],
  },

  // 미팅 단계 (2명)
  {
    id: "client-4",
    user_id: "user-1",
    company_name: "플러그 프로젝트",
    contact_name: "최민수",
    phone: "010-1234-5678",
    email: "ms.choi@pluuug.com",
    memo: "3월 15일 오후 2시 미팅 확정. 프로젝트 관리 SaaS 도입 논의.",
    stage_id: "stage-2",
    stage_order: 0,
    created_at: "2026-03-05T11:00:00Z",
    updated_at: "2026-03-11T09:00:00Z",
    stage: DUMMY_STAGES[1],
    tags: [
      makeTag("ct-8", "client-4", "opt-3"),
      makeTag("ct-9", "client-4", "opt-6"),
      makeTag("ct-10", "client-4", "opt-9"),
    ],
  },
  {
    id: "client-5",
    user_id: "user-1",
    company_name: "스마트팜 솔루션즈",
    contact_name: "정다은",
    phone: "010-9988-7766",
    email: "daeun@smartfarm.kr",
    memo: "농업 IoT 컨설팅. 다음 주 현장 방문 예정.",
    stage_id: "stage-2",
    stage_order: 1,
    created_at: "2026-03-03T09:30:00Z",
    updated_at: "2026-03-10T15:00:00Z",
    stage: DUMMY_STAGES[1],
    tags: [
      makeTag("ct-11", "client-5", "opt-3"),
      makeTag("ct-12", "client-5", "opt-5"),
      makeTag("ct-13", "client-5", "opt-8"),
    ],
  },

  // 계약 단계 (2명)
  {
    id: "client-6",
    user_id: "user-1",
    company_name: "크리에이티브 랩스",
    contact_name: "한지우",
    phone: "010-3344-5566",
    email: "jiwoo@creativelab.io",
    memo: "SNS 챌린지 캠페인. 계약금 30,000,000원. 2026년 3월~6월.",
    stage_id: "stage-3",
    stage_order: 0,
    created_at: "2026-02-20T14:00:00Z",
    updated_at: "2026-03-08T10:00:00Z",
    stage: DUMMY_STAGES[2],
    tags: [
      makeTag("ct-14", "client-6", "opt-1"),
      makeTag("ct-15", "client-6", "opt-7"),
      makeTag("ct-16", "client-6", "opt-9"),
    ],
  },
  {
    id: "client-7",
    user_id: "user-1",
    company_name: "테크노바 AI",
    contact_name: "오승현",
    phone: "010-6677-8899",
    email: "sh.oh@technova.ai",
    memo: "AI 서비스 런칭 마케팅 대행 계약. 월 5,000,000원.",
    stage_id: "stage-3",
    stage_order: 1,
    created_at: "2026-02-15T10:30:00Z",
    updated_at: "2026-03-06T16:30:00Z",
    stage: DUMMY_STAGES[2],
    tags: [
      makeTag("ct-17", "client-7", "opt-4"),
      makeTag("ct-18", "client-7", "opt-6"),
      makeTag("ct-19", "client-7", "opt-9"),
    ],
  },

  // 진행 중 단계 (3명)
  {
    id: "client-8",
    user_id: "user-1",
    company_name: "그린에너지 코리아",
    contact_name: "송민지",
    phone: "010-1122-3344",
    email: "mj.song@greenenergy.kr",
    memo: "ESG 보고서 컨설팅 진행 중. 중간 보고 3/20 예정.",
    stage_id: "stage-4",
    stage_order: 0,
    created_at: "2026-01-20T09:00:00Z",
    updated_at: "2026-03-09T11:00:00Z",
    stage: DUMMY_STAGES[3],
    tags: [
      makeTag("ct-20", "client-8", "opt-3"),
      makeTag("ct-21", "client-8", "opt-7"),
      makeTag("ct-22", "client-8", "opt-10"),
    ],
  },
  {
    id: "client-9",
    user_id: "user-1",
    company_name: "퍼스트클래스 교육",
    contact_name: "윤재호",
    phone: "010-5566-7788",
    email: "jh.yoon@firstclass.edu",
    memo: "임직원 코칭 프로그램 3개월 과정. 현재 2개월차.",
    stage_id: "stage-4",
    stage_order: 1,
    created_at: "2026-01-10T13:00:00Z",
    updated_at: "2026-03-07T14:30:00Z",
    stage: DUMMY_STAGES[3],
    tags: [
      makeTag("ct-23", "client-9", "opt-2"),
      makeTag("ct-24", "client-9", "opt-7"),
      makeTag("ct-25", "client-9", "opt-9"),
    ],
  },
  {
    id: "client-10",
    user_id: "user-1",
    company_name: "데일리푸드",
    contact_name: "강수빈",
    phone: "010-7788-9900",
    email: "sb.kang@dailyfood.co.kr",
    memo: "식품 브랜딩 + 패키지 디자인 대행. 1차 시안 전달 완료.",
    stage_id: "stage-4",
    stage_order: 2,
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-03-11T08:00:00Z",
    stage: DUMMY_STAGES[3],
    tags: [
      makeTag("ct-26", "client-10", "opt-4"),
      makeTag("ct-27", "client-10", "opt-6"),
      makeTag("ct-28", "client-10", "opt-9"),
    ],
  },

  // 계약 연장 단계 (2명)
  {
    id: "client-11",
    user_id: "user-1",
    company_name: "비전 미디어 그룹",
    contact_name: "임태현",
    phone: "010-4455-6677",
    email: "th.lim@visionmedia.kr",
    memo: "유튜브 채널 운영 대행 계약 연장. 월 8,000,000원 → 10,000,000원 조정 협의 중.",
    stage_id: "stage-5",
    stage_order: 0,
    created_at: "2025-10-01T09:00:00Z",
    updated_at: "2026-03-05T17:00:00Z",
    stage: DUMMY_STAGES[4],
    tags: [
      makeTag("ct-29", "client-11", "opt-4"),
      makeTag("ct-30", "client-11", "opt-7"),
      makeTag("ct-31", "client-11", "opt-10"),
    ],
  },
  {
    id: "client-12",
    user_id: "user-1",
    company_name: "올리브 헬스케어",
    contact_name: "배소영",
    phone: "010-2233-4455",
    email: "sy.bae@olivehealth.kr",
    memo: "건강 챌린지 프로그램 2기 연장 확정. 참여자 200명 → 500명 확대.",
    stage_id: "stage-5",
    stage_order: 1,
    created_at: "2025-11-15T11:00:00Z",
    updated_at: "2026-03-04T10:00:00Z",
    stage: DUMMY_STAGES[4],
    tags: [
      makeTag("ct-32", "client-12", "opt-1"),
      makeTag("ct-33", "client-12", "opt-6"),
      makeTag("ct-34", "client-12", "opt-9"),
    ],
  },
];

// ── Data accessor (Supabase 미연결 시 사용) ──────────────────────

export function getDummyStages(): PipelineStage[] {
  return DUMMY_STAGES;
}

export function getDummyTagCategories(): (TagCategory & { options: TagOption[] })[] {
  return DUMMY_TAG_CATEGORIES;
}

export function getDummyClients(): Client[] {
  return DUMMY_CLIENTS;
}

export function getDummyClientById(id: string): Client | null {
  return DUMMY_CLIENTS.find((c) => c.id === id) || null;
}

/**
 * Supabase가 설정되었는지 확인
 * 각 페이지에서 이 함수로 분기하여 더미데이터 or Supabase 데이터를 사용합니다.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && url.startsWith("http") && !!key;
}
