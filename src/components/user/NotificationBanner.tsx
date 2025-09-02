import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';
import { Bell, X, Play, Clock, Info } from 'lucide-react';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  description?: string;
  video_url?: string;
  youtube_url?: string;
  target_audience: 'all' | 'new_users' | 'specific_users';
  is_active: boolean;
  show_as_popup: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
  viewed?: boolean;
  dismissed?: boolean;
}

export const NotificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load dismissed notifications from localStorage
      const dismissed = localStorage.getItem(`dismissed_notifications_${user.id}`);
      if (dismissed) {
        setDismissedIds(new Set(JSON.parse(dismissed)));
      }

      // Fetch active notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .or(`target_audience.eq.all,target_audience.eq.new_users`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      // Filter out expired notifications
      const now = new Date();
      const activeNotifications = (data || []).filter(notification => {
        if (notification.expires_at) {
          return new Date(notification.expires_at) > now;
        }
        return true;
      });

      setNotifications(activeNotifications);
    } catch (error) {
      console.error('Error in loadNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (notificationId: string) => {
    const newDismissedIds = new Set(dismissedIds);
    newDismissedIds.add(notificationId);
    setDismissedIds(newDismissedIds);
    
    // Save to localStorage
    if (user) {
      localStorage.setItem(
        `dismissed_notifications_${user.id}`,
        JSON.stringify(Array.from(newDismissedIds))
      );
    }
  };

  const handleWatchVideo = (notification: NotificationData) => {
    const url = notification.youtube_url || notification.video_url;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return 'Soon';
  };

  // Filter out dismissed notifications
  const activeNotifications = notifications.filter(n => !dismissedIds.has(n.id));

  if (loading || activeNotifications.length === 0) {
    return null;
  }

  // Show only the most important notification
  const topNotification = activeNotifications[0];

  return (
    <div className="px-4 mb-4">
      <div className="bg-gradient-to-r from-[#0066FF] to-blue-600 rounded-xl p-4 shadow-sm relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white rounded-full"></div>
        </div>
        
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
            {topNotification.priority === 'urgent' ? (
              <Info className="w-5 h-5 text-white" />
            ) : (
              <Bell className="w-5 h-5 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm mb-1">
              {topNotification.title}
            </h3>
            <p className="text-white/90 text-xs leading-relaxed">
              {topNotification.message}
            </p>
            
            {/* Action Buttons */}
            {(topNotification.youtube_url || topNotification.expires_at) && (
              <div className="flex items-center gap-3 mt-3">
                {topNotification.youtube_url && (
                  <button
                    onClick={() => handleWatchVideo(topNotification)}
                    className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs font-medium hover:bg-white/30 transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    Watch
                  </button>
                )}
                
                {topNotification.expires_at && (
                  <div className="flex items-center gap-1 text-xs text-white/70 ml-auto">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeRemaining(topNotification.expires_at)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleDismiss(topNotification.id)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4 text-white/70 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};