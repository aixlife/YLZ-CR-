import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentClients } from "@/components/dashboard/recent-clients";
import { Users, ArrowRightLeft, CheckCircle, TrendingUp } from "lucide-react";
import {
  isSupabaseConfigured,
  getDummyClients,
  getDummyStages,
} from "@/lib/dummy-data";
import type { Client, PipelineStage } from "@/types";

export default async function DashboardPage() {
  let allClients: Client[] = [];
  let allStages: PipelineStage[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: clients } = await supabase
      .from("clients")
      .select("*, stage:pipeline_stages(*), tags:client_tags(*, option:tag_options(*, category:tag_categories(*)))")
      .order("created_at", { ascending: false });
    const { data: stages } = await supabase
      .from("pipeline_stages")
      .select("*")
      .order("display_order");
    allClients = (clients as Client[]) || [];
    allStages = (stages as PipelineStage[]) || [];
  } else {
    // 🔴 더미데이터 — DB 연결 시 이 블록 제거
    allClients = getDummyClients();
    allStages = getDummyStages();
  }

  const totalClients = allClients.length;
  const activeClients = allClients.filter(
    (c) => c.stage?.name === "진행 중"
  ).length;
  const contractClients = allClients.filter(
    (c) => c.stage?.name === "계약"
  ).length;
  const inquiryClients = allClients.filter(
    (c) => c.stage?.name === "문의"
  ).length;

  const recentClients = allClients.slice(0, 5);

  // Stage distribution for chart
  const stageDistribution = allStages.map((stage) => ({
    name: stage.name,
    color: stage.color,
    count: allClients.filter((c) => c.stage_id === stage.id).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="클라이언트 현황을 한눈에 확인하세요"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="전체 클라이언트"
          value={totalClients}
          icon={Users}
          color="#0A0A0A"
        />
        <StatCard
          title="신규 문의"
          value={inquiryClients}
          icon={TrendingUp}
          color="#3EA2FF"
        />
        <StatCard
          title="계약 진행"
          value={contractClients}
          icon={ArrowRightLeft}
          color="#5E6EFF"
        />
        <StatCard
          title="활성 클라이언트"
          value={activeClients}
          icon={CheckCircle}
          color="#16C93D"
        />
      </div>

      {/* Stage Distribution + Recent Clients */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stage Distribution */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-medium">파이프라인 현황</h3>
          <div className="space-y-3">
            {stageDistribution.map((stage) => (
              <div key={stage.name} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="min-w-[80px] text-sm">{stage.name}</span>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: stage.color,
                        width:
                          totalClients > 0
                            ? `${(stage.count / totalClients) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium">{stage.count}</span>
              </div>
            ))}
          </div>
        </div>

        <RecentClients clients={recentClients} />
      </div>
    </div>
  );
}
