import React, { Suspense } from "react";
import MemoryDetail from "@/components/MemoryDetail";
import Loading from "@/app/loading";

async function MemoryDetailWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MemoryDetail memoryId={id} />;
}

export default function MemoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <MemoryDetailWrapper params={params} />
    </Suspense>
  );
}
