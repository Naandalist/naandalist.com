import { Volume2, VolumeOff } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { initUiSound } from '@/lib/ui-sound'

export function SoundToggle() {
  // Start unmuted on server and client, then read the saved choice after mount,
  // so the first client render matches the server HTML.
  const [muted, setMuted] = React.useState(false)

  React.useEffect(() => {
    setMuted(initUiSound().isMuted())
  }, [])

  const toggle = () => {
    const sound = initUiSound()
    const next = !muted
    sound.setMuted(next)
    setMuted(next)
    // Unmuting plays a tick so the visitor hears what they turned on.
    if (!next) sound.play()
  }

  return (
    <Button
      variant="outline"
      size="icon"
      title={muted ? 'Turn on click sound' : 'Turn off click sound'}
      aria-pressed={muted}
      data-no-sound
      onClick={toggle}
    >
      {muted ? <VolumeOff className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
      <span className="sr-only">{muted ? 'Turn on click sound' : 'Turn off click sound'}</span>
    </Button>
  )
}
