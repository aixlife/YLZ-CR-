"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Phone, Mail } from "lucide-react";
import type { Client } from "@/types";

interface KanbanCardProps {
  client: Client;
}

export function KanbanCard({ client }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: client.id,
    data: { type: "client", client },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="min-w-0 flex-1">
          <Link
            href={`/clients/${client.id}`}
            className="font-medium hover:text-primary"
          >
            {client.company_name}
          </Link>
          {client.contact_name && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {client.contact_name}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {client.tags?.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-[11px] px-1.5 py-0"
              >
                {tag.option.name}
              </Badge>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {client.phone}
              </span>
            )}
            {client.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {client.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
