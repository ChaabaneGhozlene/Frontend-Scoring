declare module 'flv.js' {
  interface MediaDataSource {
    type:    string
    url:     string
    isLive?: boolean
  }

  interface Config {
    headers?:             Record<string, string>
    enableWorker?:        boolean
    lazyLoadMaxDuration?: number
    seekType?:            string
  }

  interface Player {
    attachMediaElement(el: HTMLVideoElement): void
    load():    void
    play():    void
    destroy(): void
    on(event: string, handler: (...args: any[]) => void): void
  }

  interface FlvJsStatic {
    isSupported(): boolean
    createPlayer(source: MediaDataSource, config?: Config): Player
    Events: {
      ERROR:      string
      MEDIA_INFO: string
    }
  }

  const flvjs: FlvJsStatic
  export = flvjs
}