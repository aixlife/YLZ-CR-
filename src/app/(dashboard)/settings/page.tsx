import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { PipelineStageManager } from "@/components/settings/pipeline-stage-manager";
import { TagCategoryManager } from "@/components/settings/tag-category-manager";
import {
  isSupabaseConfigured,
  getDummyStages,
  getDummyTagCategories,
} from "@/lib/dummy-data";
import type { PipelineStage, TagCategory, TagOption } from "@/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let stages: PipelineStage[] = [];
  let tagCategories: (TagCategory & { options: TagOption[] })[] = [];

  if (isSupabaseConfigured()) {
    const adminClient = createAdminClient();
    const [{ data: s }, { data: tc }] = await Promise.all([
      adminClient
        .from("pipeline_stages")
        .select("*")
        .order("display_order"),
      adminClient
        .from("tag_categories")
        .select("*, options:tag_options(*)")
        .order("display_order"),
    ]);
    stages = (s as PipelineStage[]) || [];
    tagCategories = (tc as (TagCategory & { options: TagOption[] })[]) || [];
  } else {
    // 🔴 더미데이터 — DB 연결 시 이 블록 제거
    stages = getDummyStages();
    tagCategories = getDummyTagCategories();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="설정"
        description="파이프라인 단계와 태그를 관리하세요"
      />
      <PipelineStageManager stages={stages} />
      <div>
        <h2 className="mb-4 text-lg font-semibold">태그 카테고리</h2>
        <TagCategoryManager categories={tagCategories} />
      </div>
    </div>
  );
}
