import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nothingPlaying": "Nothing is playing",
      "changeTheme": "Change theme",
      "albums": "Albums",
      "all": "All",
      "random": "Random",
      "recently_added": "Recently Added",
      "recently_played": "Recently Played",
      "most_played": "Most Played",
      "artists": "Artists",
      "songs": "Songs",
      "playlists": "Playlists",
      "account": "Account",
      "loading": "Loading...",
      "trackTitle": "Title",
      "artist": "Artist",
      "duration": "Duration",
      "plays": "Plays",
      "quality": "Quality",
      "fileSize": "File Size",
      "genre": "Genre",
      "error": "Error",
      "nothingFound": "Nothing found",
      "playQueue": "Play Queue",
      "language": "Language",
      "changeNickname": "Change nickname",
      "changePassword": "Change password",
      "save": "Save",
      "logout": "Logout",
      "newNickname": "New nickname",
      "newPassword": "New password",
      "play": "Play",
      "shuffle": "Shuffle",
      "addPlayQueue": "Add to play queue",
      "playNext": "Play next",
      "of": "of",
      "itemsPerPage": "Items per page",
      "searchPlaceholder": "Search",
      "allGenres": "All Genres",
      "allYears": "All Years",
      "sortName": "Alphabetical",
      "sortRandom": "Random",
      "sortNewest": "Recently Added",
      "sortPlayed": "Recently Played",
      "sortPopular": "Most Played",
      "album": "Album",
      "addToPlaylist": "Add to playlist",
      "addingTracksMessage": "Adding {{count}} tracks to...",
      "selectExisting": "Select existing",
      "createNew": "Create new",
      "selectPlaylist": "Select playlist",
      "playlistName": "Playlist name",
      "cancel": "Cancel",
      "add": "Add",
      "errorAddingTracks": "Failed to add tracks",
      "removeFromPlaylist": "Remove from playlist",
      "errorRemovingTracks": "Failed to remove tracks",
      "rescanLibrary": "Rescan library",
      "scanProgress": "Scanning folders: {{scanned}} / {{total}}",
      "rescan": "Rescan",
      "lastRescanTime": "Last rescan",
      "lastRescanDuration": "Last rescan duration",
      "lastRescanFolders": "Folders",
      "notAvailable": "N/A"
    }
  },
  ru: {
    translation: {
      "nothingPlaying": "Ничего не играет",
      "changeTheme": "Сменить тему",
      "albums": "Альбомы",
      "all": "Все",
      "random": "Случайные",
      "recently_added": "Недавно добавленные",
      "recently_played": "Недавно прослушанные",
      "most_played": "Чаще всего проигрываемые",
      "artists": "Исполнители",
      "songs": "Песни",
      "playlists": "Плейлисты",
      "account": "Аккаунт",
      "loading": "Загрузка...",
      "trackTitle": "Название",
      "artist": "Исполнитель",
      "duration": "Длительность",
      "plays": "Прослушано раз",
      "quality": "Качество",
      "fileSize": "Размер файла",
      "genre": "Жанр",
      "error": "Ошибка",
      "nothingFound": "Ничего не найдено",
      "playQueue": "Очередь воспроизведения",
      "language": "Язык",
      "changeNickname": "Сменить никнейм",
      "changePassword": "Сменить пароль",
      "save": "Сохранить",
      "logout": "Выйти",
      "newNickname": "Новый никнейм",
      "newPassword": "Новый пароль",
      "play": "Играть",
      "shuffle": "Перемешать",
      "addPlayQueue": "Добавить в очередь",
      "playNext": "Сыграть следующим",
      "of": "из",
      "itemsPerPage": "Элементов на странице",
      "searchPlaceholder": "Поиск",
      "allGenres": "Все жанры",
      "allYears": "Все годы",
      "sortName": "Алфавитный",
      "sortRandom": "Случайные",
      "sortNewest": "Недавно добавленные",
      "sortPlayed": "Недавно прослушанные",
      "sortPopular": "Чаще всего проигрываемые",
      "album": "Альбом",
      "addToPlaylist": "Добавить в плейлист",
      "addingTracksMessage": "Добавление {{count}} треков в...",
      "selectExisting": "Выбрать существующий",
      "createNew": "Создать новый",
      "selectPlaylist": "Выберите плейлист",
      "playlistName": "Название плейлиста",
      "cancel": "Отмена",
      "add": "Добавить",
      "errorAddingTracks": "Не удалось добавить треки",
      "removeFromPlaylist": "Удалить из плейлиста",
      "errorRemovingTracks": "Не удалось удалить треки",
      "rescanLibrary": "Пересканировать библиотеку",
      "scanProgress": "Сканирование папок: {{scanned}} / {{total}}",
      "rescan": "Пересканировать",
      "lastRescanTime": "Последний перескан",
      "lastRescanDuration": "Длительность перескана",
      "lastRescanFolders": "Папок",
      "notAvailable": "Н/Д"
    }
  }
};

const getLanguage = () => {
  const saved = localStorage.getItem('app-lang');

  if (!saved) return 'en';

  return JSON.parse(saved);
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguage(),
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;
