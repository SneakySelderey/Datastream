import { type PlaylistListItem, buildCoverUrl } from '../../types';

interface PlaylistCardProps {
  playlist: PlaylistListItem;
  onSelect: (playlist: PlaylistListItem) => void;
}

const formatDate = (isoDate: string) => {
  if (!isoDate) return '—';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '—';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const PlaylistCard = ({ playlist, onSelect }: PlaylistCardProps) => {
  const coverUrl = buildCoverUrl(playlist.tracks?.[0]?.album?.coverPath);

  return (
    <div
      className="p-2 hover:bg-hv transition-colors duration-300 cursor-pointer"
      onClick={() => onSelect(playlist)}
    >
      <div className="aspect-square bg-hv/50 flex items-center justify-center">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${playlist.title} playlist cover`}
          />
        ) : (
          <span className="text-sm text-fg/60">Playlist</span>
        )}
      </div>
      <h3 className="mt-1 truncate">{playlist.title}</h3>
      <p className="text-sm text-fg">
        {playlist._count.tracks} tracks &bull; {formatDate(playlist.updatedAt)}
      </p>
    </div>
  );
};

export default PlaylistCard;
