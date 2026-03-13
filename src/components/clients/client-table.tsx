"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client } from "@/types";

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-border">
        <div className="text-center">
          <p className="text-muted-foreground">등록된 클라이언트가 없습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            새 클라이언트를 추가해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>회사명</TableHead>
            <TableHead>담당자</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead>단계</TableHead>
            <TableHead>태그</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="cursor-pointer">
              <TableCell>
                <Link
                  href={`/clients/${client.id}`}
                  className="font-medium hover:text-primary"
                >
                  {client.company_name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {client.contact_name || "-"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {client.phone || client.email || "-"}
              </TableCell>
              <TableCell>
                {client.stage && (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: `${client.stage.color}18`,
                      color: client.stage.color,
                    }}
                  >
                    {client.stage.name}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {client.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.option.name}
                    </Badge>
                  ))}
                  {(client.tags?.length ?? 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(client.tags?.length ?? 0) - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
