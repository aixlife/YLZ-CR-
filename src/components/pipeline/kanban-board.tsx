"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { toast } from "sonner";
import type { Client, PipelineStage } from "@/types";

interface KanbanBoardProps {
  initialStages: PipelineStage[];
  initialClients: Client[];
}

export function KanbanBoard({
  initialStages,
  initialClients,
}: KanbanBoardProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [activeClient, setActiveClient] = useState<Client | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getClientsByStage = useCallback(
    (stageId: string) =>
      clients
        .filter((c) => c.stage_id === stageId)
        .sort((a, b) => a.stage_order - b.stage_order),
    [clients]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const client = clients.find((c) => c.id === active.id);
    if (client) setActiveClient(client);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeClient = clients.find((c) => c.id === active.id);
    if (!activeClient) return;

    // Determine target stage
    let targetStageId: string;
    const overData = over.data.current;

    if (overData?.type === "stage") {
      targetStageId = over.id as string;
    } else if (overData?.type === "client") {
      const overClient = clients.find((c) => c.id === over.id);
      if (!overClient) return;
      targetStageId = overClient.stage_id;
    } else {
      return;
    }

    if (activeClient.stage_id !== targetStageId) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === activeClient.id
            ? {
                ...c,
                stage_id: targetStageId,
                stage: initialStages.find((s) => s.id === targetStageId),
              }
            : c
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveClient(null);

    if (!over) return;

    const movedClient = clients.find((c) => c.id === active.id);
    if (!movedClient) return;

    // Calculate new order within stage
    const stageClients = getClientsByStage(movedClient.stage_id);
    const oldIndex = stageClients.findIndex((c) => c.id === active.id);

    let newIndex = stageClients.length - 1;
    const overData = over.data.current;
    if (overData?.type === "client") {
      newIndex = stageClients.findIndex((c) => c.id === over.id);
    }

    if (oldIndex !== newIndex && oldIndex !== -1) {
      const reordered = arrayMove(stageClients, oldIndex, newIndex);
      setClients((prev) => {
        const otherClients = prev.filter(
          (c) => c.stage_id !== movedClient.stage_id
        );
        return [
          ...otherClients,
          ...reordered.map((c, i) => ({ ...c, stage_order: i })),
        ];
      });
    }

    // Persist to DB
    const supabase = createClient();
    const finalStageClients = getClientsByStage(movedClient.stage_id);
    const newOrder =
      finalStageClients.findIndex((c) => c.id === movedClient.id) ??
      finalStageClients.length;

    const { error } = await supabase
      .from("clients")
      .update({
        stage_id: movedClient.stage_id,
        stage_order: newOrder,
      })
      .eq("id", movedClient.id);

    if (error) {
      toast.error("이동 실패", { description: error.message });
      setClients(initialClients);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {initialStages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            clients={getClientsByStage(stage.id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeClient ? <KanbanCard client={activeClient} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
