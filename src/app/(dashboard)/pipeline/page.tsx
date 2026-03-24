import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  isSupabaseConfigured,
  getDummyClients,
  getDummyStages,
} from "@/lib/dummy-data";
import type { Client, PipelineStage } from "@/types";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  let stages: PipelineStage[] = [];
  let clients: Client[] = [];

  if (isSupabaseConfigured()) {
    const adminClient = createAdminClient();
    const [{ data: s }, { data: c }] = await Promise.all([
      adminClient
        .from("pipeline_stages")
        .select("*")
        .order("display_order"),
      adminClient
        .from("clients")
        .select(
          "*, stage:pipeline_stages(*), tags:client_tags(*, option:tag_options(*, category:tag_categories(*)))"
        )
        .order("stage_order"),
    ]);
    stages = (s as PipelineStage[]) || [];
    clients = (c as Client[]) || [];
  } else {
    // 🔴 더미데이터 — DB 연결 시 이 블록 제거
    stages = getDummyStages();
    clients = getDummyClients();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="파이프라인"
        description="클라이언트를 단계별로 관리하세요"
        action={
          <Link href="/clients/new">
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              클라이언트 추가
            </Button>
          </Link>
        }
      />
      <KanbanBoard
        initialStages={stages}
        initialClients={clients}
      />
    </div>
  );
}
