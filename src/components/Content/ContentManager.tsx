import React from 'react';
import { ContentType } from '../../types';
import SermonManager from './SermonManager';
import EventManager from './EventManager';
import AnnouncementManager from './AnnouncementManager';
import PageManager from './PageManager';
import GalleryManager from './GalleryManager';

interface ContentManagerProps {
  activeSection: ContentType;
}

const ContentManager: React.FC<ContentManagerProps> = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'sermons':
        return <SermonManager />;
      case 'events':
        return <EventManager />;
      case 'announcements':
        return <AnnouncementManager />;
      case 'pages':
        return <PageManager />;
      case 'gallery':
        return <GalleryManager />;
      default:
        return <SermonManager />;
    }
  };

  return renderContent();
};

export default ContentManager;