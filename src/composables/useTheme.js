import { computed, ref } from 'vue'

const KEY = 'theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')

// 'light' | 'dark' | null (ikuti pengaturan perangkat)
const saved = ref(localStorage.getItem(KEY))
const systemDark = ref(media.matches)

const isDark = computed(() => (saved.value ? saved.value === 'dark' : systemDark.value))

function apply() {
  document.documentElement.classList.toggle('dark', isDark.value)
}

media.addEventListener('change', (event) => {
  systemDark.value = event.matches
  apply()
})

apply()

export function useTheme() {
  function toggle() {
    saved.value = isDark.value ? 'light' : 'dark'
    localStorage.setItem(KEY, saved.value)
    apply()
  }

  return { isDark, toggle }
}
