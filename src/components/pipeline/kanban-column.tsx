"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import type { Client, PipelineStage } from "@/types";

interface KanbanColumnProps {
  stage: PipelineStage;
  clients: Client[];
}

export function KanbanColumn({ stage, clients }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "stage", stage },
  });

  return (
    <div className="flex w-[300px] shrink-0 flex-col">
      {/* Column Header */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: stage.color }}
        />
        <h3 className="text-sm font-medium">{stage.name}</h3>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
          {clients.length}
        </span>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={`flex min-h-[200px] flex-1 flex-col gap-2 rounded-lg border-2 border-dashed p-2 transition-colors ${
          isOver ? "border-primary/50 bg-primary/5" : "border-transparent"
        }`}
      >
        <SortableContext
          items={clients.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {clients.map((client) => (
            <KanbanCard key={client.id} client={client} />
          ))}
        </SortableContext>
        {clients.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              클라이언트를 여기로 드래그하세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
