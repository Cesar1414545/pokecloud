const KEY = 'POKECLOUD_VN_SAVE';

export function loadGame(){
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}
export function saveGame(state){
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
export function clearSave(){
  try { localStorage.removeItem(KEY); } catch {}
}