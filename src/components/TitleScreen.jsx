import React, { useMemo, useState } from 'react';
import { useGame } from '../App.jsx';

const SAVE_KEY = 'POKECLOUD_VN_SAVE';

export default function TitleScreen() {
  const game = useGame();
  const [showCredits, setShowCredits] = useState(false);

  // Habilita "Continuar" se houver save (usa API do App se existir; fallback para localStorage)
  const hasSave = useMemo(() => {
    try {
      if (typeof game.hasSave === 'function') return !!game.hasSave();
      return !!localStorage.getItem(SAVE_KEY);
    } catch {
      return false;
    }
    // reavalia quando a cena mudar (útil quando volta do Menu)
  }, [game?.state?.sceneId]);

  function newGame() {
    // Limpa e começa na LAB
    game.reset();
    setTimeout(() => game.go('LAB'), 0);
  }

  function continueGame() {
    if (!hasSave) return;

    // Tenta carregar via API do App (recomendado)
    if (typeof game.loadFromStorage === 'function') {
      const ok = game.loadFromStorage();
      // Como setState é assíncrono, confere na próxima "batida de render"
      setTimeout(() => {
        if (game.state.sceneId === 'TITLE') {
          try {
            const raw = localStorage.getItem(SAVE_KEY);
            const data = raw ? JSON.parse(raw) : null;
            const next =
              (data && data.sceneId && data.sceneId !== 'TITLE')
                ? data.sceneId
                : 'LAB';
            game.go(next);
          } catch {
            game.go('LAB');
          }
        }
      }, 0);
      if (ok) return;
    }

    // Fallback: usa apenas a cena salva se API não existir
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const data = raw ? JSON.parse(raw) : null;
      const next =
        (data && data.sceneId && data.sceneId !== 'TITLE')
          ? data.sceneId
          : 'LAB';
      game.go(next);
    } catch {
      game.go('LAB');
    }
  }

  return (
    <div className="title-screen">
      <div className="title-card fancy">
        <div className="title-logo">Pokecloud VN</div>
        <div className="subtitle">Uma visual novel sobre Cloud & Datacenter</div>

        <div className="menu-vertical">
          <button className="btn-lg" onClick={newGame}>Novo Jogo</button>

          <button
            className="btn-lg btn-ghost strong"
            onClick={continueGame}
            disabled={!hasSave}
            title={hasSave ? 'Continuar' : 'Sem progresso salvo'}
          >
            Continuar
          </button>

          <button
            className="btn-lg btn-outline"
            onClick={() => setShowCredits(true)}
          >
            Créditos
          </button>
        </div>

        <div className="footnote">© SolucionaLink — Projeto de DDM</div>
      </div>

      {showCredits && (
        <div className="modal-backdrop" onClick={() => setShowCredits(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Créditos</h2>

            <ul className="credits-list">
              <li><strong>Roteiro:</strong> Denis Barbarelli dos Santos</li>
              <li><strong>Programação:</strong> Denis Barbarelli dos Santos/Danilo Merola Balbino</li>
              <li><strong>Arte/Imagens:</strong> Eric de Souza</li>
              <li><strong>Mapa de empatia/DDM:</strong> Cesar Rodrigues de Menezes</li>
            </ul>

            <div className="modal-actions">
              <button className="btn-lg" onClick={() => setShowCredits(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
