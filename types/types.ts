// how to handle the searchparams props
export interface AuthPageProps {
  type: "login" | "signup" | "passwordless";
  searchParams?: {
    callbackUrl?: string | undefined;
    // [key: string]: string | string[] | undefined;
  };
}

export interface OnboardingFlowProps {
  onComplete: () => void;
}

export interface FamilyMemories {
  id: string;
  memoryId: string;
  userId: string;
  sharedBy: string;
  memory: Memory;
  user: User;
}

export interface Memory {
  id: string;
  userId: string;
  title: string;
  content: string;
  summary?: string | null;
  date: string;
  mood?:
    | "joyful"
    | "peaceful"
    | "excited"
    | "nostalgic"
    | "grateful"
    | "reflective"
    | null;
  tags?: string[];
  images?: string[];
  location?: string | null;
  isAiGenerated?: boolean | null;
  syncStatus?: "synced" | "pending" | "offline" | null;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  user?: {
    id: string;
    name: string;
    image?: string | null;
    username?: string | null;
  };
  reactions?: Reaction[];
  comments?: Comment[];
  reactionCount?: number;
  commentCount?: number;
}

export interface Timeline  {
    date: Date;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    title: string;
    content: string;
    summary: string | null;
    location: string | null;
    mood: string | null;
    isPublic: boolean;
    isAiGenerated: boolean;
    syncStatus: string;
    user: {
        id: string;
        email: string;
        name: string | null;
        password: string | null;
        image: string | null;
        bio: string | null;
        username: string | null;
        isOnboarded: boolean;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: Date | null;
    };
    memoryMedia: {
        id: string;
        type: string;
        memoryId: string;
        url: string;
        filename: string;
        size: number | null;
        metadata: unknown;
        storageProvider: string;
        storageKey: string | null;
    }[];
    memoryTags: {
        tag: {
            name: string;
            color: string;
        }
    }[];
    reactions: Reaction[];
    comments: Comment[];
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  image: string | null;
  bio: string | null;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: Date | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Analytics {
  totalMemories: number;
  memoriesThisMonth: number;
  averagePerWeek: number;
  longestStreak: number;
  topMoods: { mood: string; count: number; percentage: number }[];
  topTags: { tag: string; count: number; percentage: number }[];
  monthlyActivity: { month: string; memories: number }[];
  weeklyPattern: { day: string; memories: number }[];
  heatmap?: Record<string, number>;
  tagClusters?: { tag: string; related: { name: string; count: number }[] }[];
}

export interface Story {
  id: string;
  title: string;
  content: string;
  dateRange: { start: string; end: string };
  tone: "reflective" | "celebratory" | "nostalgic";
  length: "short" | "medium" | "long";
  status: "generating" | "ready" | "error";
  createdAt: string;
}

export interface Comment {
  id: string;
  memoryId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    name: string;
    image?: string;
  };
}

export interface Reaction {
  id: string;
  memoryId: string;
  userId: string;
  type: string;
  user?: {
    name: string;
    image?: string;
  };
}

export interface Follow {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  isFollowing?: boolean;
}

export class HttpError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}
