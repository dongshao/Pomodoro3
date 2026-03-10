export const playChime = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) {
      return
    }

    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(660, context.currentTime + 0.2)

    gain.gain.setValueAtTime(0.001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28)

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start()
    oscillator.stop(context.currentTime + 0.3)

    oscillator.onended = () => {
      void context.close()
    }
  } catch {
    // 音频失败时降级为静默，不影响主流程
  }
}
