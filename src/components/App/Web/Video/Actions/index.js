import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'aphrodite'
import Input from 'components/Shared/Input'
import Button from 'components/Shared/Button'
import Icon from 'components/Shared/Icon'
import Select from 'components/Shared/Select'
import styles from './styles'

const propTypes = {
  values: PropTypes.object,
  selected: PropTypes.bool.isRequired,
  locked: PropTypes.bool.isRequired,
  format: PropTypes.string.isRequired,
  progress: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onConfigure: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired
}

const defaultProps = {
  values: {
    song: null,
    artist: null
  }
}

class Actions extends Component{
  constructor(props){
    super(props)

    this.invert = this.invert.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
    this.onMouseEnter = this.onMouseEnter.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)

    this.state = {
      icons: {
        artist: 'fa-user',
        song: 'fa-music'
      }
    }
  }

  invert(){
    const artist = this.props.values.artist
    const song = this.props.values.song

    this.props.onChange({
      target: {
        name: 'artist',
        value: song
      }
    })

    this.props.onChange({
      target: {
        name: 'song',
        value: artist
      }
    })
  }

  handleSelect(){
    this.props.onSelect()
  }

  onMouseEnter(icon){
    this.setState({
      icons: Object.assign({}, this.state.icons, {
        [icon]: 'fa-sort'
      })
    })
  }

  onMouseLeave(icon){
    this.setState({
      icons: Object.assign({}, this.state.icons, {
        [icon]: { artist: 'fa-user', song: 'fa-music' }[icon]
      })
    })
  }

  render(){
    return(
      <div className={css(styles.container)}>
         <div className={css(styles.inputs)}>
          <Input
            icon={<Icon
              label={this.state.icons.artist}
              title={'Invert "artist" and "song"'}
              onMouseEnter={() => this.onMouseEnter('artist')}
              onMouseLeave={() => this.onMouseLeave('artist')}
              onClick={() => this.invert()}
              className={css(styles.icon)}
            />}
            type="text"
            name="artist"
            value={this.props.values.artist}
            placeholder="Artist"
            onChange={this.props.onChange}
            disabled={this.props.progress !== null}
          />
          <Input
            icon={<Icon
              label={this.state.icons.song}
              title={'Invert "song" and "artist"'}
              onMouseEnter={() => this.onMouseEnter('song')}
              onMouseLeave={() => this.onMouseLeave('song')}
              onClick={() => this.invert()}
              className={css(styles.icon)}
            />}
            type="text"
            name="song"
            value={this.props.values.song}
            placeholder="Song"
            onChange={this.props.onChange}
            disabled={this.props.progress !== null}
          />
        </div>
        <div className={css(styles.buttons)}>
          <Button
            appearance="light"
            icon={this.props.selected ? 'fa-undo':'fa-plus'}
            className={css(styles.select)}
            onClick={this.handleSelect}
            disabled={this.props.locked}
          >
            {this.props.selected ?
              'Remove':'Include'
            }
          </Button>
          <div className={css(styles.group)}>
            <Select
              icon={this.props.progress === null ? null : (this.props.progress === 100 ? 'fa-check' : 'fa-circle-o-notch fa-spin fa-fw')}
              selected={this.props.format}
              active={this.props.progress !== null}
              disabled={this.props.locked && this.props.selected}
              onChange={this.props.onConfigure}
              options={{
                mp3: {
                  icon: 'fa-volume-up',
                  label: 'audio - mp3'
                },
                aac: {
                  icon: 'fa-volume-up',
                  label: 'audio - aac'
                },
                vorbis: {
                  icon: 'fa-volume-up',
                  label: 'audio - vorbis'
                },
                opus: {
                  icon: 'fa-volume-up',
                  label: 'audio - opus'
                },
                mp4: {
                  icon: 'fa-film',
                  label: 'video - mp4'
                },
                webm: {
                  icon: 'fa-film',
                  label: 'video - webm'
                }
              }}
            />
            <Button
              className={css(styles.download)}
              style={{display: 'flex', flex: 1}}
              progress={this.props.progress}
              onClick={this.props.onDownload}
              disabled={this.props.locked && this.props.selected}
            >
              {this.props.progress === null ?
                'Download' : this.props.progress === 100 ? 'Done' : 'Cancel'
              }
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

Actions.propTypes = propTypes

export default Actions
