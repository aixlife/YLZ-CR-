"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { Client, PipelineStage, TagCategory, TagOption } from "@/types";
import { INQUIRY_TYPES } from "@/types";
import { X } from "lucide-react";

interface ClientFormProps {
  client?: Client;
  stages: PipelineStage[];
  tagCategories: (TagCategory & { options: TagOption[] })[];
}

export function ClientForm({ client, stages, tagCategories }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: client?.company_name || "",
    contact_name: client?.contact_name || "",
    phone: client?.phone || "",
    email: client?.email || "",
    inquiry_type: client?.inquiry_type || "",
    memo: client?.memo || "",
    stage_id: client?.stage_id || stages[0]?.id || "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(
    client?.tags?.map((t) => t.option_id) || []
  );

  const isEditing = !!client;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    // 로그인 유저 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("로그인이 필요합니다", { description: "회원가입 또는 로그인 후 이용해주세요." });
      setLoading(false);
      router.push("/login");
      return;
    }

    if (isEditing) {
      // Update client
      const { error } = await supabase
        .from("clients")
        .update({
          company_name: formData.company_name,
          contact_name: formData.contact_name || null,
          phone: formData.phone || null,
          email: formData.email || null,
          inquiry_type: formData.inquiry_type || null,
          memo: formData.memo || null,
          stage_id: formData.stage_id,
        })
        .eq("id", client.id);

      if (error) {
        toast.error("수정 실패", { description: error.message });
        setLoading(false);
        return;
      }

      // Update tags: delete all then re-insert
      await supabase.from("client_tags").delete().eq("client_id", client.id);
      if (selectedTags.length > 0) {
        await supabase.from("client_tags").insert(
          selectedTags.map((optionId) => ({
            client_id: client.id,
            option_id: optionId,
          }))
        );
      }

      toast.success("클라이언트 수정 완료");
      router.push(`/clients/${client.id}`);
    } else {
      // Create client
      const { data: newClient, error } = await supabase
        .from("clients")
        .insert({
          user_id: user.id,
          company_name: formData.company_name,
          contact_name: formData.contact_name || null,
          phone: formData.phone || null,
          email: formData.email || null,
          inquiry_type: formData.inquiry_type || null,
          memo: formData.memo || null,
          stage_id: formData.stage_id,
          stage_order: 0,
        })
        .select()
        .single();

      if (error || !newClient) {
        toast.error("등록 실패", { description: error?.message || "알 수 없는 오류" });
        setLoading(false);
        return;
      }

      // Insert tags
      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase.from("client_tags").insert(
          selectedTags.map((optionId) => ({
            client_id: newClient.id,
            option_id: optionId,
          }))
        );
        if (tagError) {
          console.error("태그 저장 실패:", tagError.message);
        }
      }

      toast.success("클라이언트 등록 완료");
      router.push(`/clients/${newClient.id}`);
    }
    setLoading(false);
    router.refresh();
  };

  const toggleTag = (optionId: string) => {
    setSelectedTags((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>{isEditing ? "클라이언트 수정" : "새 클라이언트"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">회사명 *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, company_name: e.target.value }))
                }
                placeholder="회사명을 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_name">담당자</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, contact_name: e.target.value }))
                }
                placeholder="담당자명"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="010-0000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Inquiry Type */}
          <div className="space-y-2">
            <Label>문의 유형</Label>
            <Select
              value={formData.inquiry_type}
              onValueChange={(v) => {
                if (v) setFormData((p) => ({ ...p, inquiry_type: v }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="문의 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {INQUIRY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage Select */}
          <div className="space-y-2">
            <Label>파이프라인 단계</Label>
            <Select
              value={formData.stage_id}
              onValueChange={(v) => {
                if (v) setFormData((p) => ({ ...p, stage_id: v }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="단계 선택" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      {stage.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <Label>태그</Label>
            {tagCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {category.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.options.map((option) => {
                    const isSelected = selectedTags.includes(option.id);
                    return (
                      <Badge
                        key={option.id}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleTag(option.id)}
                      >
                        {option.name}
                        {isSelected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모</Label>
            <Textarea
              id="memo"
              value={formData.memo}
              onChange={(e) =>
                setFormData((p) => ({ ...p, memo: e.target.value }))
              }
              placeholder="클라이언트에 대한 메모를 작성하세요"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? isEditing
                ? "수정 중..."
                : "등록 중..."
              : isEditing
                ? "수정하기"
                : "등록하기"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
