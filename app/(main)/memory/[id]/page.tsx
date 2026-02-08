"use client";
import React from "react";
import { useParams } from "next/navigation";
import MemoryDetail from "@/components/MemoryDetail";

export default function MemoryDetailPage() {
  const params = useParams();
  const memoryId = params.id as string;

  return <MemoryDetail memoryId={memoryId} />;
}
