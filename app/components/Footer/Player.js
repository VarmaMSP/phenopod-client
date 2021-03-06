// @flow
import type {Episode} from '../../types/podcast'
import React, {Component} from 'react'
import {formatDate} from '../../utils/utils'

type Props = {|
  podcastTitle: string,
  episode: Episode
|}

type State = {|
  status: 'PLAY' | 'PAUSE' | 'LOAD' | 'SEEK',
  duration: number,
  currentTime: number,
  reload: boolean
|}

const audio: any = document.createElement('audio')

export default class Audio extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      status: 'LOAD',
      duration: 0,
      currentTime: 0,
      reload: false
    }
    // handle pause and play
    audio.addEventListener('pause', () =>
      this.setState({status: 'PAUSE'})
    )
    audio.addEventListener('play', () =>
      this.setState({status: 'PLAY'})
    )
    // handle change in duration and currentTime
    audio.addEventListener('durationchange', () =>
      this.setState({duration: audio.duration})
    )
    audio.addEventListener('timeupdate', () =>
      this.setState({currentTime: audio.currentTime})
    )
    // handle seek
    audio.addEventListener('seeking', () => {
      audio.pause()
      this.setState({status: 'SEEK'})
    })
    audio.addEventListener('seeked', () => {
      audio.play()
      this.setState({status: 'PLAY'})
    })
    // handle initial load
    audio.addEventListener('loadstart', () =>
      this.setState({status: 'LOAD'})
    )
    audio.addEventListener('canplay', () => {
      audio.play()
      this.setState({status: 'PLAY'})
    })
    // Keyboard events
    window.addEventListener('keydown', e => {
      e.preventDefault()
      let { keyCode } = e
      let { status } = this.state
      switch (keyCode) {
        case 32: {
          if (status === 'PLAY') {
            audio.pause()
            this.setState({status: 'PAUSE'})
          }
          if (status === 'PAUSE') {
            audio.play()
            this.setState({status: 'PLAY'})
          }
          break
        }
      }
    })
  }

  componentWillMount () {
    audio.src = this.props.episode.link
    audio.type = this.props.episode.fileType
  }

  componentDidMount () {
    audio.play()
  }

  componentWillReceiveProps (nextProps: Props) {
    audio.src = nextProps.episode.link
    audio.type = nextProps.episode.fileType
    this.setState({reload: true})
  }

  componentDidUpdate () {
    if (this.state.reload === true) {
      this.setState({reload: false})
      audio.load()
      audio.play()
    }
  }

  handleToggle () {
    let { status } = this.state
    if (status === 'PLAY') {
      audio.pause()
      this.setState({status: 'PAUSE'})
    }
    if (status === 'PAUSE') {
      audio.play()
      this.setState({status: 'PLAY'})
    }
  }

  handleSeek (e: SyntheticInputEvent<HTMLInputElement>) { // eslint-disable-line no-undef
    let seekTime = Number(e.target.value)
    audio.currentTime = seekTime
  }

  render () {
    let { duration, currentTime, status } = this.state
    let { podcastTitle, episode } = this.props
    let { title, date } = episode
    let playIconSrc = status === 'PLAY' ? '/img/pause.png' : '/img/play.png'

    return (
      <div className={status === 'LOAD' ? 'overlay' : ''}>
        {/* CONTROLS */}
        <div className='controls'>
          <img src={playIconSrc} onClick={this.handleToggle.bind(this)} id='play' />
          <label htmlFor='footer-state'><img src='/img/arrow.png' id='arrow' /></label>
        </div>

        <div className='player'>
          {/* DETAILS */}
          <div className='details'>
            <div className='now-playing'>Now Playing</div>
            <div className='episode-title'>{title}</div>
            <div className='episode-details'>
              <span className='date'>{formatDate(date)}</span>
              <span className='dot'> • </span>
              <span className='podcast-title'>{podcastTitle}</span>
            </div>
          </div>

          {/* AUDIO COMPONENT */}
          <div className='audio'>
            <img src={playIconSrc} onClick={this.handleToggle.bind(this)} id='play-icon' />
            <input type='range' id='playback-slider'
              min='0' max={Math.round(duration).toString()}
              step='5' value={Math.round(currentTime).toString()}
              onChange={this.handleSeek.bind(this)}
            />
            <span id='time'>{`${formatTime(currentTime)} / ${formatTime(duration)}`}</span>
          </div>
        </div>
      </div>
    )
  }
}

function formatTime (timeInSec: ?number): string {
  if (!timeInSec) return '00:00:00'
  let formattedTime = new Date(0, 0, 0, 0, 0, timeInSec)
    .toTimeString()
    .match(/\d{2}:\d{2}:\d{2}/)
  return formattedTime ? formattedTime[0] : '00:00:00'
}
