import { Metadata } from "next";
import db from "@/drizzle/index";
import { memories } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Heart } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const token = (await params).token;
  const memory = await db.query.memories.findFirst({
    where: eq(memories.shareToken, token),
    with: {
      memoryMedia: true,
    },
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
      images: memory.memoryMedia?.[0]?.url ? [memory.memoryMedia[0].url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: memory.title,
      description: memory.summary || memory.content.slice(0, 160),
      images: memory.memoryMedia?.[0]?.url ? [memory.memoryMedia[0].url] : [],
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
    joyful: "border-yellow-200 bg-yellow-50 text-yellow-800",
    peaceful: "border-blue-200 bg-blue-50 text-blue-800",
    excited: "border-orange-200 bg-orange-50 text-orange-800",
    nostalgic: "border-purple-200 bg-purple-50 text-purple-800",
    grateful: "border-green-200 bg-green-50 text-green-800",
    reflective: "border-neutral-200 bg-neutral-50 text-neutral-800",
  };

  return (
    <div className="selection:bg-primary-100 selection:text-primary-900 min-h-screen bg-[#FAFAFA] font-sans">
      <main className="mx-auto max-w-4xl px-4 pt-8 pb-32 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center space-x-3 px-4 sm:px-0">
          <div className="bg-primary-900 shadow-primary-900/20 flex h-8 w-8 rotate-3 transform items-center justify-center rounded-lg shadow-lg">
            <span className="font-serif text-sm font-bold text-white">M</span>
          </div>
          <span className="font-display text-base font-bold tracking-tight text-neutral-900">
            Memory Lane
          </span>
        </div>
        <article className="overflow-hidden rounded-4xl border border-neutral-100 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          {/* Hero Header Area */}
          <header className="relative w-full">
            {memory.memoryMedia && memory.memoryMedia.length > 0 ? (
              <div className="relative aspect-21/9 min-h-100 w-full overflow-hidden">
                <Image
                  src={memory.memoryMedia[0].url}
                  alt={memory.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute right-0 bottom-0 left-0 p-8 md:p-14">
                  <h1 className="font-display text-4xl leading-tight font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
                    {memory.title}
                  </h1>
                </div>
              </div>
            ) : (
              <div className="from-primary-900 via-primary-800 to-primary-950 relative w-full bg-linear-to-br p-8 pt-24 md:p-14 md:pt-32">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                <h1 className="font-display relative text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  {memory.title}
                </h1>
              </div>
            )}

            {/* Meta Tags overlaid or directly below */}
            <div
              className={`relative flex flex-wrap items-center gap-4 border-b border-neutral-100 px-8 py-6 md:px-14 ${memory.memoryMedia && memory.memoryMedia.length > 0 ? "bg-white" : "bg-white"}`}
            >
              <div className="flex items-center space-x-2 rounded-full border border-neutral-200/60 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-500">
                <Calendar size={16} className="text-primary-500" />
                <span>
                  {new Date(memory.date).toLocaleDateString("en-US", { dateStyle: "long" })}
                </span>
              </div>

              {memory.location && (
                <div className="flex items-center space-x-2 rounded-full border border-neutral-200/60 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-500">
                  <MapPin size={16} className="text-primary-500" />
                  <span>{memory.location}</span>
                </div>
              )}

              {memory.mood && (
                <div
                  className={`flex items-center space-x-1.5 rounded-full border px-3 py-1.5 text-xs font-bold tracking-widest uppercase ${moodColors[memory.mood as keyof typeof moodColors] || "border-neutral-200 bg-neutral-50 text-neutral-600"}`}
                >
                  <Heart weight="fill" size={14} className="opacity-80" />
                  <span>{memory.mood}</span>
                </div>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 gap-12 p-8 md:p-14 lg:grid-cols-[1fr_300px]">
            {/* Story Content */}
            <div className="space-y-10">
              {memory.summary && (
                <div className="relative">
                  <span className="text-primary-200 font-display absolute top-0 -left-4 text-6xl leading-none opacity-50">
                    "
                  </span>
                  <p className="font-display border-primary-200 relative z-10 border-l-4 pl-6 text-2xl leading-relaxed text-neutral-800 italic sm:text-3xl">
                    {memory.summary}
                  </p>
                </div>
              )}

              <div
                className="prose prose-lg prose-neutral md:prose-xl prose-p:my-6 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline first-letter:font-display first-letter:text-primary-900 max-w-none font-serif leading-[1.8] text-neutral-800 first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:font-bold"
                dangerouslySetInnerHTML={{ __html: memory.content }}
              />

              {/* Extra Images - Enhanced Grid */}
              {memory.memoryMedia && memory.memoryMedia.length > 1 && (
                <div className="mt-12 space-y-4">
                  <h3 className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
                    Captured Moments
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {memory.memoryMedia.slice(1).map((media, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-4/3 overflow-hidden rounded-4xl border border-neutral-100 bg-neutral-100 shadow-md transition-all duration-500 hover:shadow-xl"
                      >
                        <Image
                          src={media.url}
                          alt={`Memory imagery ${idx + 2}`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Author / Sidebar area */}
            <aside className="space-y-8 lg:border-l lg:border-neutral-100 lg:pl-12">
              <div className="rounded-3xl border border-neutral-100/50 bg-neutral-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-neutral-100 bg-white p-1 shadow-sm">
                  {memory.user.image ? (
                    <Image
                      src={memory.user.image}
                      alt={memory.user.name || "User"}
                      width={80}
                      height={80}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-primary-900 text-3xl font-bold">
                      {(memory.user.name || "M")[0]}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl font-bold text-neutral-900">
                  {memory.user.name}
                </h3>
                <p className="mt-1 text-sm text-[10px] font-medium tracking-widest text-neutral-500 uppercase">
                  Author
                </p>

                <div className="mx-auto my-4 h-px w-12 bg-neutral-200" />
                <p className="text-xs text-neutral-600 italic">
                  Preserving life's beautiful moments on Memory Lane.
                </p>
              </div>

              {memory.memoryTags && memory.memoryTags.length > 0 && (
                <div>
                  <h4 className="mb-4 text-xs font-bold tracking-widest text-neutral-400 uppercase">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {memory.memoryTags.map((mt) => (
                      <span
                        key={mt.tag.name}
                        className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-bold tracking-wider text-neutral-600 uppercase shadow-sm"
                      >
                        #{mt.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-neutral-900 px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-xl space-y-10">
          <div className="bg-primary-900 shadow-primary-900/40 mx-auto flex h-14 w-14 rotate-3 transform items-center justify-center rounded-2xl shadow-2xl">
            <span className="font-serif text-2xl font-bold text-white">M</span>
          </div>
          <h2 className="font-display text-4xl leading-tight font-bold sm:text-5xl">
            Your life is a story worth telling.
          </h2>
          <p className="text-lg text-neutral-400">
            Join thousands of others who are preserving their heritage, memories, and moments in a
            private, beautiful sanctuary.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-white px-8 py-4 font-bold text-neutral-900 shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] active:scale-95"
          >
            Create Your Own Timeline
          </Link>
        </div>
      </footer>
    </div>
  );
}
