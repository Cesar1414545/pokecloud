import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadGame, saveGame, clearSave } from './engine/save';
import TitleScreen from './components/TitleScreen.jsx';
import SceneRenderer from './components/SceneRenderer.jsx';
import HUD from './components/HUD.jsx';
import { scenesById, firstSceneId } from './data/scenes';

const Ctx = createContext(null);
export const useGame = () => useContext(Ctx);

export default function App() {
  // carrega do storage; se não houver, usa estado inicial
  const [state, setState] = useState(() => {
    const loaded = loadGame();
    return loaded || {
      sceneId: firstSceneId,
      savedPokemons: 0, // vidas
      flags: {},        // passos/ganhos
      checkpointStep: 0 // passo atual dentro da cena
    };
  });

  // PWA: registra Service Worker (opcional)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // autosave em QUALQUER mudança de estado, EXCETO quando estiver no TITLE
  useEffect(() => {
    if (state.sceneId !== 'TITLE') {
      saveGame(state);
    }
  }, [state]);

  const api = useMemo(() => ({
    state,

    // troca de cena -> zera checkpointStep para não herdar índice inválido
    go: (nextId) =>
      setState(s => ({ ...s, sceneId: nextId, checkpointStep: 0 })),

    // vidas
    addLife: (n = 1) =>
      setState(s => ({ ...s, savedPokemons: Math.max(0, s.savedPokemons + n) })),

    // flags de progresso
    setFlag: (k, v = true) =>
      setState(s => ({ ...s, flags: { ...s.flags, [k]: v } })),

    // checkpoint de passo (SceneRenderer chama quando step muda)
    setCheckpointStep: (n) =>
      setState(s => ({ ...s, checkpointStep: Number.isFinite(n) ? n : 0 })),

    // reset total (novo jogo)
    reset: () => {
      clearSave();
      setState({ sceneId: firstSceneId, savedPokemons: 0, flags: {}, checkpointStep: 0 });
    },

    // utilidades para TitleScreen
    hasSave: () => !!loadGame(),

    loadFromStorage: () => {
      const data = loadGame();
      if (!data) return false;
      setState({
        sceneId: data.sceneId || firstSceneId,
        savedPokemons: data.savedPokemons ?? 0,
        flags: data.flags || {},
        checkpointStep: Number.isFinite(data.checkpointStep) ? data.checkpointStep : 0,
      });
      return true;
    },
  }), [state]);

  const scene = scenesById[state.sceneId];

  return (
    <Ctx.Provider value={api}>
      {state.sceneId === 'TITLE' ? (
        <TitleScreen />
      ) : (
        <div className="game-root">
          <HUD
            lives={state.savedPokemons}
            onReset={() => api.reset()}
            onMenu={() => api.go('TITLE')}   // voltar ao menu (TITLE não salva)
          />
          <SceneRenderer scene={scene} />
        </div>
      )}
    </Ctx.Provider>
  );
}
