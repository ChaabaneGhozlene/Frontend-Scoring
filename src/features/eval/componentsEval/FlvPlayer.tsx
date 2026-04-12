import { useRef } from 'react'
import { traceScreenAction } from '../Evalservice'

interface Props {
  url:      string
  token:    string
  recordId: number
  fileName?: string
}

const FlvPlayer = ({ url, token, recordId, fileName }: Props) => {
  const urlWithToken = `${url}?token=${encodeURIComponent(token)}`
const videoRef = useRef<HTMLVideoElement>(null)

const sendTrace = (eventType: 'Play' | 'Pause' | 'Stop') => {
  if (!recordId) return
  const video = videoRef.current
  traceScreenAction({
    recordId,
    eventType,
    fileName: fileName ?? url,  // ← envoyer l'URL complète, pas juste le nom
    position: video ? String(Math.floor(video.currentTime)) : '0',
    duration: video ? String(Math.floor(video.duration))    : '0',
  }).catch(() => {})
}

return (
  <video
    ref={videoRef}
    key={urlWithToken}
    controls
    style={{ width: '100%', borderRadius: 6, background: '#000' }}
    onPlay={()  => sendTrace('Play')}
    onPause={() => sendTrace('Pause')}
    onEnded={() => sendTrace('Stop')}
  >
    <source src={urlWithToken} type="video/mp4" />
  </video>
)
}

export default FlvPlayer