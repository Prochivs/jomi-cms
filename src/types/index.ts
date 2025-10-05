export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface Sermon {
  id: string;
  title: string;
  description: string;
  preacher: string;
  date: string;
  audioUrl?: string;
  videoUrl?: string;
  scripture: string;
  series?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  registrationRequired: boolean;
  maxAttendees?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  publishDate: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentType = 'sermons' | 'events' | 'announcements' | 'pages' | 'gallery';