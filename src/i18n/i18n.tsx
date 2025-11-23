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
      "played": "Played",
      "quality": "Quality",
      "fileSize": "File Size",
      "genres": "Genres",
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
      "addPlayQueue": "Add to play queue"
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
      "played": "Прослушано раз",
      "quality": "Качество",
      "fileSize": "Размер файла",
      "genres": "Жанры",
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
      "addPlayQueue": "Добавить в очередь"
    }
  }
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: JSON.parse(localStorage.getItem('app-lang')|| 'en'),
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;