import { onMounted, onUnmounted } from 'vue'

export function useEscapeKey(handler: () => void) {
  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') handler()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}
