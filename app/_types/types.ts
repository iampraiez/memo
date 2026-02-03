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
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    theme: "light" | "dark" | "system";
  };
  role?: "user" | "admin";
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
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
