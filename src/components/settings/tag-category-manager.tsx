"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X, GripVertical } from "lucide-react";
import type { TagCategory, TagOption } from "@/types";

interface TagCategoryManagerProps {
  categories: (TagCategory & { options: TagOption[] })[];
}

export function TagCategoryManager({ categories }: TagCategoryManagerProps) {
  const router = useRouter();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newOptionNames, setNewOptionNames] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("tag_categories").insert({
      name: newCategoryName.trim(),
      display_order: categories.length,
    });

    if (error) {
      toast.error("카테고리 추가 실패", { description: error.message });
    } else {
      toast.success("카테고리 추가 완료");
      setNewCategoryName("");
      router.refresh();
    }
    setLoading(false);
  };

  const handleAddOption = async (categoryId: string) => {
    const name = newOptionNames[categoryId]?.trim();
    if (!name) return;
    setLoading(true);
    const supabase = createClient();

    const category = categories.find((c) => c.id === categoryId);
    const { error } = await supabase.from("tag_options").insert({
      category_id: categoryId,
      name,
      display_order: category?.options.length || 0,
    });

    if (error) {
      toast.error("옵션 추가 실패", { description: error.message });
    } else {
      toast.success("옵션 추가 완료");
      setNewOptionNames((p) => ({ ...p, [categoryId]: "" }));
      router.refresh();
    }
    setLoading(false);
  };

  const handleDeleteOption = async (optionId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("tag_options")
      .delete()
      .eq("id", optionId);

    if (error) {
      toast.error("삭제 실패", { description: error.message });
    } else {
      toast.success("옵션 삭제 완료");
      router.refresh();
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const supabase = createClient();

    // Delete options first
    await supabase.from("tag_options").delete().eq("category_id", categoryId);
    const { error } = await supabase
      .from("tag_categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      toast.error("삭제 실패", { description: error.message });
    } else {
      toast.success("카테고리 삭제 완료");
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id} className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">{category.name}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDeleteCategory(category.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {category.options
                .sort((a, b) => a.display_order - b.display_order)
                .map((option) => (
                  <Badge
                    key={option.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {option.name}
                    <button
                      onClick={() => handleDeleteOption(option.id)}
                      className="rounded-full p-0.5 hover:bg-foreground/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="새 옵션 이름"
                value={newOptionNames[category.id] || ""}
                onChange={(e) =>
                  setNewOptionNames((p) => ({
                    ...p,
                    [category.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOption(category.id);
                  }
                }}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddOption(category.id)}
                disabled={loading}
                className="h-8"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Category */}
      <Card className="border-dashed border-border shadow-sm">
        <CardContent className="flex items-center gap-2 p-4">
          <Input
            placeholder="새 카테고리 이름"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCategory();
              }
            }}
          />
          <Button onClick={handleAddCategory} disabled={loading}>
            <Plus className="mr-1.5 h-4 w-4" />
            추가
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
