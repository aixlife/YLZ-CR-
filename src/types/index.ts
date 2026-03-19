export interface Profile {
  id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  user_id: string;
  name: string;
  display_order: number;
  color: string;
  created_at: string;
}

export interface TagCategory {
  id: string;
  user_id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface TagOption {
  id: string;
  category_id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  inquiry_type?: string | null;
  memo: string | null;
  stage_id: string;
  stage_order: number;
  created_at: string;
  updated_at: string;
  // joined
  stage?: PipelineStage;
  tags?: (ClientTag & { option: TagOption & { category: TagCategory } })[];
}

export interface ClientTag {
  id: string;
  client_id: string;
  option_id: string;
}

export const DEFAULT_STAGES = [
  { name: "문의", color: "#3EA2FF", display_order: 0 },
  { name: "미팅", color: "#FF8B49", display_order: 1 },
  { name: "계약", color: "#5E6EFF", display_order: 2 },
  { name: "계약 완료", color: "#FF6B9D", display_order: 3 },
  { name: "진행 중", color: "#16C93D", display_order: 4 },
  { name: "계약 연장", color: "#995AFF", display_order: 5 },
] as const;

export const INQUIRY_TYPES = ["챌린지", "코칭", "컨설팅", "대행"] as const;

export const DEFAULT_TAG_CATEGORIES = [
  {
    name: "서비스 유형",
    display_order: 0,
    options: ["챌린지", "코칭", "컨설팅", "대행"],
  },
  {
    name: "규모",
    display_order: 1,
    options: ["소기업", "중견기업", "대기업"],
  },
  {
    name: "계약 기간",
    display_order: 2,
    options: ["1개월", "3개월", "1년"],
  },
] as const;
