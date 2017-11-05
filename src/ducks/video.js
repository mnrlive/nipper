import { combineEpics } from 'redux-observable'
import getArtistTitle from 'get-artist-title'
import Rx from 'rxjs/Rx'
import * as contextDuck from 'ducks/context'
import * as errorDuck from 'ducks/error'
import * as videosDuck from 'ducks/videos'
import epyd, { CODECS } from 'services/epyd'
import saveAs from 'save-as'
import uuidv4 from 'uuid/v4'
import humanize from 'utils/humanize'

// Actions
export const PARSE = 'nipper/videos/video/PARSE'
export const INCLUDE = 'nipper/videos/video/INCLUDE'
export const SELECT = 'nipper/videos/video/SELECT'
export const ANNOTATE = 'nipper/videos/video/ANNOTATE'
export const CONFIGURE = 'nipper/videos/video/CONFIGURE'
export const DOWNLOAD = 'nipper/videos/video/DOWNLOAD'
export const PROGRESS = 'nipper/videos/video/PROGRESS'

// Reducer
const initial = {
  /* EXAMPLE :
    uuid: '30fff21e-469a-437c-8cd4-483a9348ad15',
    id: 'Y2vVjlT306s',
    selected: false,
    format: 'mp3',
    progress: null, // or number
    details: {
      title: 'Hello - World',
      author: 'helloWorld',
      channel: 'UCj9CxlpVDiacX7ZlzuLuGiQ',
      description: 'Hello by World',
      thumbnail: 'https://i.ytimg.com/vi/ryti_lCKleA/sddefault.jpg',
      duration: 'PT3M11S'
    },
    statistics: {
      views: 0,
      likes: 0,
      dislikes: 0
    },
    tags: {
      artist: 'World',
      song: 'Hello',
      cover: [object Blob]
    }
  */
}

export default function reducer(state = initial, action = {}) {
  switch (action.type) {
    case INCLUDE:
      return action.video
    case SELECT:
      return {
        ...state,
        selected: (action.to === null ? !state.selected : action.to)
      }
    case ANNOTATE:
      return {
        ...state,
        tags: {
          ...state.tags,
          [action.key]: action.value
        }
      }
    case CONFIGURE:
      return {
        ...state,
        format: action.format
      }
    case DOWNLOAD:
      return {
        ...state,
        progress: (state.progress === null ? 0 : null)
      }
    case PROGRESS:
      return {
        ...state,
        progress: action.progress
      }
    default:
      return state
  }
}

// Actions Creators
export const parseVideo = (raw) => ({
  type: PARSE,
  video: {
    uuid: uuidv4(),
    id: raw.id,
    selected: false,
    locked: false,
    progress: null,
    format: 'mp3',
    details: {
      title: raw.snippet.title,
      author: raw.snippet.channelTitle,
      channel: raw.snippet.channelId,
      description: raw.snippet.description,
      thumbnail: Object.keys(raw.snippet.thumbnails)
        .filter(key => ['standard', 'high', 'medium', 'default'].includes(key)) // fixed ratio
        .map(key => raw.snippet.thumbnails[key])
        .reduce((accumulator, thumbnail) => thumbnail.width > accumulator.width ? thumbnail : accumulator, { width: 0 })
        .url,
      duration: humanize.duration.fromISO8601(raw.contentDetails.duration)
    },
    statistics: {
      views: parseInt(raw.statistics.viewCount),
      likes: parseInt(raw.statistics.likeCount),
      dislikes: parseInt(raw.statistics.dislikeCount)
    },
    tags: {
      artist: ((getArtistTitle(raw.snippet.title) || [null, null])[0] || raw.snippet.channelTitle),
      song: ((getArtistTitle(raw.snippet.title) || [null, null])[1] || raw.snippet.title),
      cover: null
    }
  }
})

export const includeVideo = (video) => ({
  type: INCLUDE,
  uuid: video.uuid,
  video: video
})

export const selectVideo = (uuid, to = null) => ({
  type: SELECT,
  uuid,
  to
})

export const lockVideo = (uuid, to = null) => ({
  type: SELECT,
  uuid,
  to
})

export const configureVideo = (uuid, format) => ({
  type: CONFIGURE,
  uuid,
  format
})

export const annotateVideo = (uuid, key, value) => ({
  type: ANNOTATE,
  uuid,
  key,
  value
})

export const downloadVideo = (uuid, tags = null) => ({
  type: DOWNLOAD,
  uuid,
  tags
})

export const progressVideo = (uuid, progress) => ({
  type: PROGRESS,
  uuid,
  progress
})

// Epics
export const epic = combineEpics(
  downloadVideoEpic
)

export function downloadVideoEpic(action$, store){
  return action$.ofType(DOWNLOAD)
    .mergeMap(action => store.getState().videos.entities[action.uuid].progress === null ? Rx.Observable.never() : Rx.Observable.of(action))
    .mergeMap(action => {
      const video = store.getState().videos.entities[action.uuid]

      return epyd.proceed(video.id, CODECS[video.format], action.tags)
        .mergeMap(msg => {
          if (msg.type === 'progress') {
            return Rx.Observable.of(progressVideo(action.uuid, msg.data))
          } else if (msg.type === 'done') {
            saveAs(msg.data, msg.data.name)
            return Rx.Observable.of(downloadVideo(action.uuid)).delay(1500)
          }
        })
        .catch(error => Rx.Observable.of(errorDuck.includeError('videos', error.message, true), downloadVideo(action.uuid)))
        .takeUntil(action$.filter(next => (next.type === DOWNLOAD && next.uuid === action.uuid) || next.type === contextDuck.CLEAR))
    })
    .filter(next => typeof next === 'object' && next.constructor.name === 'Object')
}
