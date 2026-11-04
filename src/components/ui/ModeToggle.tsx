import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { Button } from '@/components/ui/Button'

export function ModeToggle() {
  const [theme, setThemeState] = React.useState<'light' | 'dark'>('light')

  // The page's <html> class is the source of truth, set before paint by Head.astro.
  // Read it after mount only, and apply the theme only on click, so a page change
  // cannot override the choice the visitor saved.
  React.useEffect(() => {
    setThemeState(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    document.documentElement.classList.add('disable-transitions')
    document.documentElement.classList.toggle('dark', next === 'dark')
    window.getComputedStyle(document.documentElement).getPropertyValue('opacity')
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('disable-transitions')
    })
    setThemeState(next)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      title="Toggle theme"
      onClick={toggleTheme}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'light' ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Sun className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -30, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Moon className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
