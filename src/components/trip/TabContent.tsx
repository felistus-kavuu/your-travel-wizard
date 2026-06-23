import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TabKind, Trip } from "@/lib/trip-types";

async function fetchTab(kind: TabKind, trip: Trip): Promise<string> {
  const res = await fetch("/api/trip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, trip }),
  });
  if (!res.ok) {
    let msg = "Something went wrong. Please retry.";
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) msg = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const data = (await res.json()) as { text: string };
  return data.text;
}

export function TabContent({ kind, trip }: { kind: TabKind; trip: Trip }) {
  const tripKey = `${trip.destination}|${trip.startDate}|${trip.endDate}|${trip.budget}|${trip.currency}|${trip.interests.join(",")}`;
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["trip", kind, tripKey],
    queryFn: () => fetchTab(kind, trip),
    staleTime: Infinity,
    retry: 0,
  });

  if (isLoading || isFetching && !data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-6 w-1/2 mt-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-9/12" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-foreground">Couldn't load this tab</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(error as Error)?.message ?? "Unknown error"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-foreground prose-strong:text-foreground prose-li:my-1 prose-p:leading-relaxed">
      <ReactMarkdown>{data ?? ""}</ReactMarkdown>
    </div>
  );
}
