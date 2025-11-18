import { type Album } from '../types';

interface AlbumGridProps {
  albums: Album[];
  onSelectAlbum: (album: Album) => void;
}

const AlbumGrid = ({ albums, onSelectAlbum }: AlbumGridProps) => {
  return (
    <div className="p-2 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] justify-center gap-1">
      {albums.map((album) => (
        <div
          key={album.id}
          className="p-2 hover:bg-hv transition-colors duration-300 cursor-pointer"
          onClick={() => onSelectAlbum(album)}
        >
          <div>
            <img
              src={album.cover}
              alt={`${album.title} album cover`}
            />
          </div>
          <h3 className="mt-1 truncate">{album.title}</h3>
          <p className="text-sm text-fg">
            {album.artist} &bull; {album.date}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AlbumGrid;