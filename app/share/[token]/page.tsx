import { Metadata } from "next";
import db from "@/drizzle/index";
import { memories } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Heart } from "@phosphor-icons/react/dist/ssr";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const token = (await params).token;
  const memory = await db.query.memories.findFirst({
    where: eq(memories.shareToken, token),
  });

  if (!memory || !memory.isPublic) {
    return { title: "Memory Not Found" };
  }

  return {
    title: `${memory.title} | Memory Lane`,
    description: memory.summary || memory.content.slice(0, 160),
    openGraph: {
      title: memory.title,
      description: memory.summary || memory.content.slice(0, 160),
      type: "article",
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const token = (await params).token;

  const memory = await db.query.memories.findFirst({
    where: eq(memories.shareToken, token),
    with: {
      user: true,
      memoryMedia: true,
      memoryTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!memory || !memory.isPublic) {
    notFound();
  }

  const moodColors = {
    joyful: "border-yellow-200 bg-yellow-50/30 text-yellow-800",
    peaceful: "border-blue-200 bg-blue-50/30 text-blue-800",
    excited: "border-orange-200 bg-orange-50/30 text-orange-800",
    nostalgic: "border-purple-200 bg-purple-50/30 text-purple-800",
    grateful: "border-green-200 bg-green-50/30 text-green-800",
    reflective: "border-gray-200 bg-gray-50/30 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-12">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-2xl">
        {/* Hero Image */}
        {memory.memoryMedia && memory.memoryMedia.length > 0 && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={memory.memoryMedia[0].url}
              alt={memory.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between border-b border-neutral-100 pb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-900 text-secondary-400 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full font-bold shadow-lg">
                {memory.user.image ? (
                  <Image
                    src={memory.user.image}
                    alt={memory.user.name || "User"}
                    width={48}
                    height={48}
                  />
                ) : (
                  (memory.user.name || "M")[0]
                )}
              </div>
              <div>
                <p className="font-bold text-neutral-900">{memory.user.name}</p>
                <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                  Shared Heritage
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                <Calendar size={16} />
                <span>
                  {new Date(memory.date).toLocaleDateString("en-US", { dateStyle: "long" })}
                </span>
              </div>
              {memory.location && (
                <div className="mt-1 flex items-center justify-end space-x-2 text-sm text-neutral-500">
                  <MapPin size={16} />
                  <span>{memory.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">
                {memory.title}
              </h1>
              {memory.mood && (
                <div
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-widest uppercase ${moodColors[memory.mood as keyof typeof moodColors] || "border-neutral-200 bg-neutral-50 text-neutral-600"}`}
                >
                  <Heart className="mr-2" weight="fill" size={14} />
                  {memory.mood}
                </div>
              )}
            </div>

            <div className="prose prose-neutral max-w-none">
              <p className="text-xl leading-relaxed font-medium text-neutral-800 italic">
                {memory.summary}
              </p>
              <div className="h-4" />
              <div className="text-lg leading-relaxed whitespace-pre-wrap text-neutral-700">
                {memory.content}
              </div>
            </div>

            {/* Tags */}
            {memory.memoryTags && memory.memoryTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-8">
                {memory.memoryTags.map((mt) => (
                  <span
                    key={mt.tag.name}
                    className="rounded-full bg-neutral-100 px-4 py-1.5 text-xs font-bold tracking-wider text-neutral-600 uppercase"
                  >
                    #{mt.tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer / CTA */}
          <div className="mt-16 border-t border-neutral-100 pt-12 text-center">
            <p className="mb-6 font-medium text-neutral-600">
              Preserving stories, protecting heritage.
            </p>
            <a
              href="/"
              className="bg-primary-900 inline-flex items-center rounded-2xl px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Learn about Memory Lane
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
