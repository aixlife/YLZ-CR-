import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/clients/client-form";
import {
  isSupabaseConfigured,
  getDummyStages,
  getDummyTagCategories,
} from "@/lib/dummy-data";
import type { PipelineStage, TagCategory, TagOption } from "@/types";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  let stages: PipelineStage[] = [];
  let tagCategories: (TagCategory & { options: TagOption[] })[] = [];

  if (isSupabaseConfigured()) {
    const adminClient = createAdminClient();
    const { data: s } = await adminClient
      .from("pipeline_stages")
      .select("*")
      .order("display_order");
    const { data: tc } = await adminClient
      .from("tag_categories")
      .select("*, options:tag_options(*)")
      .order("display_order");
    stages = (s as PipelineStage[]) || [];
    tagCategories = (tc as (TagCategory & { options: TagOption[] })[]) || [];
  } else {
    // 🔴 더미데이터 — DB 연결 시 이 블록 제거
    stages = getDummyStages();
    tagCategories = getDummyTagCategories();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="새 클라이언트 등록" />
      <ClientForm stages={stages} tagCategories={tagCategories} />
    </div>
  );
}
