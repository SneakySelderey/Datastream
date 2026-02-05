import { type Album, buildCoverUrl } from '../../types';

interface AlbumCardProps {
  album: Album;
  onSelect: (album: Album) => void;
}

const AlbumCard = ({ album, onSelect }: AlbumCardProps) => {
  const coverUrl = buildCoverUrl(album.coverPath ?? album.tracks?.[0]?.coverPath);

  return (
    <div
      className="p-2 hover:bg-hv transition-colors duration-300 cursor-pointer"
      onClick={() => onSelect(album)}
    >
      <div className="aspect-square">
        <img
          src={coverUrl ?? ''}
          alt={`${album.title} album cover`}
          className="h-full w-full object-cover"
        />
      </div>
      <h3 className="mt-1 truncate">{album.title}</h3>
      <p className="text-sm text-fg">
        {(album.artists ?? []).map(artist => artist.name).join(', ') || '—'} &bull; {album.date ?? '—'}
      </p>
    </div>
  );
};

export default AlbumCard;
