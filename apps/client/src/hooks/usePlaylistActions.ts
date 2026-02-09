export const usePlaylistActions = () => {
  const addTracksToPlaylist = async (playlistId: string, trackIds: string[]) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/add`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackIds }),
      });

      if (!response.ok) throw new Error('Failed to add tracks');
      
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const removeTracksFromPlaylist = async (playlistId: string, trackIds: string[]) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/remove`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackIds }),
      });

      if (!response.ok) throw new Error('Failed to remove tracks');

      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return { addTracksToPlaylist, removeTracksFromPlaylist };
};
