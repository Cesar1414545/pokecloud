import { registerSW } from 'virtual:pwa-register'

export const initSW = () => {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateSW()
    },
    onOfflineReady() {
      console.log('PokeCloud pronto para uso offline!')
    },
  })
}
