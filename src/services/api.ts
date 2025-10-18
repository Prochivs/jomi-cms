
import { User, Sermon, Event, Announcement, Page } from '../types';

// Backend API base URL
const API_BASE_URL = 'https://jomi-backend.vercel.app';

// Helper function to make requests without authentication
const makeRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    // Bypass authentication - allow login without credentials
    const user: User = {
      id: '1',
      email: email || 'admin@church.com',
      name: 'Admin',
      role: 'admin'
    };
    
    const token = 'mock-jwt-token-' + Date.now();
    
    return {
      user,
      token
    };
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return null;
    }
    
    // Bypass authentication - return admin user
    const user: User = {
      id: '1',
      email: 'admin@church.com',
      name: 'Admin',
      role: 'admin'
    };
    
    return user;
  }
};

export const sermonApi = {
  getAll: async (): Promise<Sermon[]> => {
    const response = await makeRequest('/sermons');
    
    if (response.success) {
      // Transform backend data to frontend format
      return response.data.map((sermon: any) => ({
        id: sermon.id.toString(),
        title: sermon.title,
        description: sermon.description || '',
        preacher: sermon.speaker,
        date: sermon.date,
        scripture: sermon.scripture || '',
        series: sermon.series || '',
        audioUrl: sermon.audioUrl || '',
        videoUrl: sermon.videoUrl || '',
        createdAt: sermon.createdAt,
        updatedAt: sermon.createdAt
      }));
    }
    
    throw new Error('Failed to fetch sermons');
  },
  
  getById: async (id: string): Promise<Sermon | null> => {
    const response = await makeRequest(`/sermons/${id}`);
    
    if (response.success) {
      const sermon = response.data;
      return {
        id: sermon.id.toString(),
        title: sermon.title,
        description: sermon.description || '',
        preacher: sermon.speaker,
        date: sermon.date,
        scripture: sermon.scripture || '',
        series: sermon.series || '',
        audioUrl: sermon.audioUrl || '',
        videoUrl: sermon.videoUrl || '',
        createdAt: sermon.createdAt,
        updatedAt: sermon.createdAt
      };
    }
    
    return null;
  },
  
  create: async (sermon: Omit<Sermon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sermon> => {
    const sermonData = {
      title: sermon.title,
      speaker: sermon.preacher,
      date: sermon.date,
      description: sermon.description,
      scripture: sermon.scripture,
      series: sermon.series,
      audioUrl: sermon.audioUrl,
      videoUrl: sermon.videoUrl,
      notesUrl: '', // Backend uses notesUrl instead of separate notes
      featured: false
    };

    const response = await makeRequest('/sermons', {
      method: 'POST',
      body: JSON.stringify(sermonData),
    });

    if (response.success) {
      const newSermon = response.data;
      return {
        id: newSermon.id.toString(),
        title: newSermon.title,
        description: newSermon.description || '',
        preacher: newSermon.speaker,
        date: newSermon.date,
        scripture: newSermon.scripture || '',
        series: newSermon.series || '',
        audioUrl: newSermon.audioUrl || '',
        videoUrl: newSermon.videoUrl || '',
        createdAt: newSermon.createdAt,
        updatedAt: newSermon.createdAt
      };
    }
    
    throw new Error('Failed to create sermon');
  },
  
  update: async (id: string, sermon: Partial<Sermon>): Promise<Sermon> => {
    const sermonData = {
      title: sermon.title,
      speaker: sermon.preacher,
      date: sermon.date,
      description: sermon.description,
      scripture: sermon.scripture,
      series: sermon.series,
      audioUrl: sermon.audioUrl,
      videoUrl: sermon.videoUrl,
      notesUrl: '', // Backend uses notesUrl instead of separate notes
      featured: false
    };

    const response = await makeRequest(`/sermons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sermonData),
    });

    if (response.success) {
      const updatedSermon = response.data;
      return {
        id: updatedSermon.id.toString(),
        title: updatedSermon.title,
        description: updatedSermon.description || '',
        preacher: updatedSermon.speaker,
        date: updatedSermon.date,
        scripture: updatedSermon.scripture || '',
        series: updatedSermon.series || '',
        audioUrl: updatedSermon.audioUrl || '',
        videoUrl: updatedSermon.videoUrl || '',
        createdAt: updatedSermon.createdAt,
        updatedAt: updatedSermon.updatedAt || updatedSermon.createdAt
      };
    }
    
    throw new Error('Failed to update sermon');
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await makeRequest(`/sermons/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error('Failed to delete sermon');
    }
  }
};

export const eventApi = {
  getAll: async (): Promise<Event[]> => {
    const response = await makeRequest('/events');
    
    if (response.success) {
      // Transform backend data to frontend format
      return response.data.map((event: any) => ({
        id: event.id.toString(),
        title: event.title,
        description: event.description || '',
        date: event.date.split('T')[0], // Extract date part
        time: '18:00', // Default time since backend doesn't have time field
        location: event.location,
        registrationRequired: event.requiresRegistration || false,
        maxAttendees: event.capacity || 0,
        createdAt: event.createdAt,
        updatedAt: event.createdAt
      }));
    }
    
    throw new Error('Failed to fetch events');
  },
  
  create: async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    const eventData = {
      title: event.title,
      date: event.date,
      location: event.location,
      description: event.description,
      type: 'general',
      requiresRegistration: event.registrationRequired || false,
      capacity: event.maxAttendees || 0
    };

    const response = await makeRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });

    if (response.success) {
      const newEvent = response.data;
      return {
        id: newEvent.id.toString(),
        title: newEvent.title,
        description: newEvent.description || '',
        date: newEvent.date.split('T')[0],
        time: event.time || '18:00',
        location: newEvent.location,
        registrationRequired: newEvent.requiresRegistration || false,
        maxAttendees: newEvent.capacity || 0,
        createdAt: newEvent.createdAt,
        updatedAt: newEvent.createdAt
      };
    }
    
    throw new Error('Failed to create event');
  },
  
  update: async (id: string, event: Partial<Event>): Promise<Event> => {
    const eventData = {
      title: event.title,
      date: event.date,
      location: event.location,
      description: event.description,
      type: 'general',
      requiresRegistration: event.registrationRequired,
      capacity: event.maxAttendees
    };

    const response = await makeRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });

    if (response.success) {
      const updatedEvent = response.data;
      return {
        id: updatedEvent.id.toString(),
        title: updatedEvent.title,
        description: updatedEvent.description || '',
        date: updatedEvent.date.split('T')[0],
        time: event.time || '18:00',
        location: updatedEvent.location,
        registrationRequired: updatedEvent.requiresRegistration || false,
        maxAttendees: updatedEvent.capacity || 0,
        createdAt: updatedEvent.createdAt,
        updatedAt: updatedEvent.createdAt
      };
    }
    
    throw new Error('Failed to update event');
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await makeRequest(`/events/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error('Failed to delete event');
    }
  }
};

// Gallery API (using the gallery endpoint from backend)
export const galleryApi = {
  getAll: async (): Promise<any[]> => {
    const response = await makeRequest('/gallery');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error('Failed to fetch gallery items');
  },
  
  create: async (gallery: any): Promise<any> => {
    // Don't use makeRequest for file uploads, use fetch directly
    const response = await fetch(`${API_BASE_URL}/gallery`, {
      method: 'POST',
      body: gallery, // Pass FormData directly (no JSON.stringify, no Content-Type header)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error('Failed to create gallery item');
  },
  
  update: async (id: string, gallery: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      method: 'PUT',
      body: gallery, // Pass FormData directly
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error('Failed to update gallery item');
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await makeRequest(`/gallery/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error('Failed to delete gallery item');
    }
  }
};

// Mock APIs for features not yet implemented in backend
export const announcementApi = {
  getAll: async (): Promise<Announcement[]> => {
    // Return empty array since backend doesn't have announcements yet
    return [];
  },
  
  create: async (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> => {
    throw new Error('Announcements not implemented in backend yet');
  },
  
  update: async (id: string, announcement: Partial<Announcement>): Promise<Announcement> => {
    throw new Error('Announcements not implemented in backend yet');
  },
  
  delete: async (id: string): Promise<void> => {
    throw new Error('Announcements not implemented in backend yet');
  }
};

export const pageApi = {
  getAll: async (): Promise<Page[]> => {
    // Return empty array since backend doesn't have pages yet
    return [];
  },
  
  create: async (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page> => {
    throw new Error('Pages not implemented in backend yet');
  },
  
  update: async (id: string, page: Partial<Page>): Promise<Page> => {
    throw new Error('Pages not implemented in backend yet');
  },
  
  delete: async (id: string): Promise<void> => {
    throw new Error('Pages not implemented in backend yet');
  }
};