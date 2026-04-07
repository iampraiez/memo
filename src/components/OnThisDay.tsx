"use client";
import React from "react";
import { useOnThisDay } from "@/hooks/useSocial";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calendar, CaretRight } from "@phosphor-icons/react";
import Loading from "@/components/ui/Loading";
import Image from "next/image";
import Link from "next/link";

export default function OnThisDay() {
  const { data, isLoading } = useOnThisDay();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <Card className="flex h-32 items-center justify-center border-dashed border-neutral-200 bg-neutral-50/50">
        <Loading size="sm" text="Reliving the past..." />
      </Card>
    );
  }

  const memories = data?.memories || [];

  if (memories.length === 0) {
    return null; // Don't show anything if no historical memories
  }

  const firstMemory = memories[0];
  const yearDiff = new Date().getFullYear() - new Date(firstMemory.date).getFullYear();

  return (
    <Card className="border-primary-100 from-primary-50/50 overflow-hidden bg-linear-to-br shadow-sm transition-all hover:shadow-md">
      <div className="p-5">
        <header className="mb-4 flex items-center justify-between">
          <div className="text-primary-600 flex items-center space-x-2">
            <Calendar weight="duotone" size={20} />
            <span className="text-xs font-bold tracking-widest uppercase">On This Day</span>
          </div>
          <span className="bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 text-[10px] font-bold">
            {yearDiff} {yearDiff === 1 ? "Year" : "Years"} Ago
          </span>
        </header>

        <div className="space-y-3">
          <h3 className="font-display line-clamp-1 text-lg font-bold text-neutral-900">
            {firstMemory.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600">
            {firstMemory.content}
          </p>

          {firstMemory.images?.[0] && (
            <div className="relative mt-3 aspect-video overflow-hidden rounded-xl">
              <Image
                src={firstMemory.images[0]}
                alt={firstMemory.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          <Link href={`/memory/${firstMemory.id}`} className="block pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:bg-primary-100/50 group/btn w-full justify-between rounded-xl px-4 text-xs font-bold"
            >
              <span>Revisit Memory</span>
              <CaretRight
                size={14}
                className="transition-transform group-hover/btn:translate-x-1"
              />
            </Button>
          </Link>
        </div>
      </div>

      {memories.length > 1 && (
        <div className="bg-primary-50/30 border-primary-100 border-t px-5 py-2">
          <p className="text-primary-600 text-[10px] font-medium">
            + {memories.length - 1} more from this day
          </p>
        </div>
      )}
    </Card>
  );
}
