export interface MemoryFormImage {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface MemoryFormData {
  title: string;
  content: string;
  date: string;
  location: string;
  mood: string;
  tags: string[];
  images: MemoryFormImage[];
  unlockDate?: string;
}

export interface MemoryFormErrors {
  title?: string;
  mood?: string;
  location?: string;
}
