"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import type { PipelineStage } from "@/types";

const PRESET_COLORS = [
  "#3EA2FF",
  "#FF8B49",
  "#5E6EFF",
  "#16C93D",
  "#995AFF",
  "#FC4E4E",
  "#FFB800",
  "#0A0A0A",
];

interface PipelineStageManagerProps {
  stages: PipelineStage[];
}

export function PipelineStageManager({ stages }: PipelineStageManagerProps) {
  const router = useRouter();
  const [newStageName, setNewStageName] = useState("");
  const [newStageColor, setNewStageColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleAddStage = async () => {
    if (!newStageName.trim()) return;
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("pipeline_stages").insert({
      name: newStageName.trim(),
      color: newStageColor,
      display_order: stages.length,
    });

    if (error) {
      toast.error("단계 추가 실패", { description: error.message });
    } else {
      toast.success("단계 추가 완료");
      setNewStageName("");
      router.refresh();
    }
    setLoading(false);
  };

  const handleDeleteStage = async (stageId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("pipeline_stages")
      .delete()
      .eq("id", stageId);

    if (error) {
      toast.error("삭제 실패", {
        description:
          error.message.includes("violates foreign key")
            ? "이 단계에 클라이언트가 있어 삭제할 수 없습니다."
            : error.message,
      });
    } else {
      toast.success("단계 삭제 완료");
      router.refresh();
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">파이프라인 단계</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Existing Stages */}
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span className="text-sm font-medium">{stage.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => handleDeleteStage(stage.id)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}

        {/* Add New Stage */}
        <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
          <div className="flex gap-2">
            <Input
              placeholder="새 단계 이름"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddStage();
                }
              }}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              onClick={handleAddStage}
              disabled={loading}
              className="h-8"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              추가
            </Button>
          </div>
          <div className="flex gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={`h-5 w-5 rounded-full border-2 transition-transform ${
                  newStageColor === color
                    ? "scale-110 border-foreground"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setNewStageColor(color)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
