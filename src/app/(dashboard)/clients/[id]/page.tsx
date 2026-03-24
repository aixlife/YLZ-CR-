import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, Pencil, Phone, Mail, Building2, User } from "lucide-react";
import {
  isSupabaseConfigured,
  getDummyClientById,
  getDummyStages,
  getDummyTagCategories,
} from "@/lib/dummy-data";
import type { Client, PipelineStage, TagCategory, TagOption } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function ClientDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { edit } = await searchParams;

  let client: Client | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("clients")
      .select(
        "*, stage:pipeline_stages(*), tags:client_tags(*, option:tag_options(*, category:tag_categories(*)))"
      )
      .eq("id", id)
      .single();
    client = data as Client | null;
  } else {
    // 🔴 더미데이터 — DB 연결 시 이 블록 제거
    client = getDummyClientById(id);
  }

  if (!client) notFound();

  const isEditing = edit === "true";

  if (isEditing) {
    let stages: PipelineStage[] = [];
    let tagCategories: (TagCategory & { options: TagOption[] })[] = [];

    if (isSupabaseConfigured()) {
      const editClient = await createClient();
      const { data: s } = await editClient
        .from("pipeline_stages")
        .select("*")
        .order("display_order");
      const { data: tc } = await editClient
        .from("tag_categories")
        .select("*, options:tag_options(*)")
        .order("display_order");
      stages = (s as PipelineStage[]) || [];
      tagCategories = (tc as (TagCategory & { options: TagOption[] })[]) || [];
    } else {
      stages = getDummyStages();
      tagCategories = getDummyTagCategories();
    }

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader title="클라이언트 수정" />
        <ClientForm
          client={client}
          stages={stages}
          tagCategories={tagCategories}
        />
      </div>
    );
  }

  const typedClient = client;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={typedClient.company_name}
        action={
          <div className="flex gap-2">
            <Link href="/clients">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                목록
              </Button>
            </Link>
            <Link href={`/clients/${id}?edit=true`}>
              <Button size="sm">
                <Pencil className="mr-1.5 h-4 w-4" />
                수정
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Info Card */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">회사명</p>
                <p className="font-medium">{typedClient.company_name}</p>
              </div>
            </div>
            {typedClient.contact_name && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">담당자</p>
                  <p>{typedClient.contact_name}</p>
                </div>
              </div>
            )}
            {typedClient.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">전화번호</p>
                  <p>{typedClient.phone}</p>
                </div>
              </div>
            )}
            {typedClient.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">이메일</p>
                  <p>{typedClient.email}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage + Tags Card */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">단계 및 태그</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                파이프라인 단계
              </p>
              {typedClient.stage && (
                <Badge
                  variant="secondary"
                  className="text-sm"
                  style={{
                    backgroundColor: `${typedClient.stage.color}18`,
                    color: typedClient.stage.color,
                  }}
                >
                  {typedClient.stage.name}
                </Badge>
              )}
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-xs text-muted-foreground">태그</p>
              {typedClient.tags && typedClient.tags.length > 0 ? (
                <div className="space-y-2">
                  {/* Group tags by category */}
                  {Array.from(
                    new Set(
                      typedClient.tags.map((t) => t.option.category.name)
                    )
                  ).map((categoryName) => (
                    <div key={categoryName}>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        {categoryName}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {typedClient.tags
                          ?.filter(
                            (t) => t.option.category.name === categoryName
                          )
                          .map((tag) => (
                            <Badge key={tag.id} variant="outline">
                              {tag.option.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  설정된 태그가 없습니다.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memo Card */}
      {typedClient.memo && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">메모</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{typedClient.memo}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
