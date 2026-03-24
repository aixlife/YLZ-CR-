import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ClientTable } from "@/components/clients/client-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { isSupabaseConfigured, getDummyClients } from "@/lib/dummy-data";
import type { Client } from "@/types";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  let clients: Client[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("clients")
      .select(
        "*, stage:pipeline_stages(*), tags:client_tags(*, option:tag_options(*, category:tag_categories(*)))"
      )
      .order("created_at", { ascending: false });
    clients = (data as Client[]) || [];
  } else {
    // 🔴 더미데이터 — DB 연결 시 이 블록 제거
    clients = getDummyClients();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="클라이언트"
        description="전체 클라이언트를 관리하세요"
        action={
          <Link href="/clients/new">
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              클라이언트 추가
            </Button>
          </Link>
        }
      />
      <ClientTable clients={clients} />
    </div>
  );
}
