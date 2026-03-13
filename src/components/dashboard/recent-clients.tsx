"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client } from "@/types";
import { formatDistanceToNow } from "@/lib/utils";

interface RecentClientsProps {
  clients: Client[];
}

export function RecentClients({ clients }: RecentClientsProps) {
  if (clients.length === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">최근 클라이언트</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            등록된 클라이언트가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">최근 클라이언트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{client.company_name}</p>
              {client.contact_name && (
                <p className="truncate text-sm text-muted-foreground">
                  {client.contact_name}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {client.stage && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${client.stage.color}18`,
                    color: client.stage.color,
                  }}
                >
                  {client.stage.name}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(client.created_at)}
              </span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
