export interface InstagramAccountStats {
  followerCount: number;
  followingCount: number;
  mediaCount: number;
  username: string;
}

export interface InstagramMediaItem {
  id: string;
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS';
  permalink: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
}

export async function fetchInstagramAccountData(usernameOrId: string): Promise<{
  stats: InstagramAccountStats;
  media: InstagramMediaItem[];
}> {
  // Normalized Instagram fixture for sandbox/demo
  return {
    stats: {
      followerCount: 48500,
      followingCount: 380,
      mediaCount: 245,
      username: usernameOrId.replace('@', ''),
    },
    media: [
      {
        id: 'ig_media_01',
        caption: '5 essential tips for writing clean TypeScript architecture. Swipe for examples! 💻 #coding #webdev',
        mediaType: 'CAROUSEL_ALBUM',
        permalink: 'https://instagram.com/p/demo1',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        likeCount: 2840,
        commentsCount: 95,
      },
      {
        id: 'ig_media_02',
        caption: 'Setup tour 2026: Minimalist developer workspace and dual 4K monitors. 🖥️ #desksetup #developer',
        mediaType: 'REELS',
        permalink: 'https://instagram.com/p/demo2',
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
        likeCount: 6410,
        commentsCount: 218,
      },
    ],
  };
}
