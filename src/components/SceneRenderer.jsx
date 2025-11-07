import React, { useState, useEffect } from 'react';
import { useGame } from '../App.jsx';
import DialogueBox from './DialogueBox.jsx';
import ChoiceList from './ChoiceList.jsx';
import Quiz from './Quiz.jsx';

export default function SceneRenderer({ scene }) {
  const game = useGame();

  // começa pelo checkpoint salvo, mas vamos garantir reset ao trocar de cena
  const [step, setStep] = useState(() => Number(game?.state?.checkpointStep ?? 0));
  const [banner, setBanner] = useState('');

  // Ao trocar de cena: sempre inicia do passo 0 e zera banner + checkpoint
  useEffect(() => {
    setStep(0);
    setBanner('');
    if (typeof game.setCheckpointStep === 'function') {
      game.setCheckpointStep(0);
    }
  }, [scene]);

  // Se por qualquer motivo step sair do range da cena, força para 0
  useEffect(() => {
    const len = scene?.steps?.length ?? 0;
    if (len > 0 && (step < 0 || step >= len)) {
      setStep(0);
      if (typeof game.setCheckpointStep === 'function') {
        game.setCheckpointStep(0);
      }
    } else {
      // passo válido: atualiza checkpoint
      if (typeof game.setCheckpointStep === 'function') {
        game.setCheckpointStep(step);
      }
    }
  }, [step, scene]);

  const S = scene?.steps?.[step];
  if (!S) {
    return (
      <div
        className="scene"
        style={{ backgroundImage: `url(/images/${scene?.bg})` }}
      />
    );
  }

  function next() {
    if (step + 1 < scene.steps.length) {
      setStep(step + 1);
    } else {
      if (scene.nextId) {
        game.go(typeof scene.nextId === 'function' ? scene.nextId(game.state) : scene.nextId);
      }
    }
  }

  // erro: professor = tenta novamente (fica na mesma pergunta);
  // passageiro = mensagem específica e avança;
  // demais = mostra correta e avança (boss ainda desconta vida)
  const handleWrong = () => {
    const correct = S.answers?.find((a) => a.correct)?.label || '—';

    // ✅ Professor (tentativas infinitas)
    if (S.infinite) {
      setBanner('');
      return;
    }

    // 🚆 Passageiro (trem)
    if (S.special === 'train') {
      setBanner('Você errou! Deve ter faltado em alguma das aulas do Professor haha!');
      next();
      return;
    }

    // padrão
    setBanner(
      `Você errou. A resposta correta é: "${correct}". Você não ganhou vidas e não resgatou Pokémons.`
    );

    if (S.boss) {
      // 👉 se ficar sem vidas, vai para a tela de Game Over (sem resetar aqui)
      if (game.state.savedPokemons <= 1) {
        game.go('GAMEOVER');
        return;
      }
      game.addLife(-1);
    }

    next();
  };

  return (
    <div
      className="scene"
      style={{ backgroundImage: `url(/images/${scene.bg})` }}
    >
      <div className="actors">
        {scene.actors?.map((a, i) => (
          <img
            key={i}
            src={`/images/${a.src}`}
            alt={a.name}
            className={`actor ${a.pos || 'center'} ${a.cls || ''}`}
          />
        ))}
      </div>

      {scene.extra && (
        <img
          src={`/images/${scene.extra.src}`}
          alt={scene.extra.alt}
          className={`extra ${scene.extra.pos || 'center'}`}
        />
      )}

      <div className="ui">
        {S.type === 'dialogue' && (
          <DialogueBox name={S.name} text={S.text} onNext={!S.auto ? next : null}>
            {S.auto && (
              <div className="actions">
                <button onClick={next}>Continuar</button>
              </div>
            )}
          </DialogueBox>
        )}

        {S.type === 'choices' && (
          <ChoiceList
            options={S.options.map((opt) => ({
              label: opt.label,
              disabled: opt.disabled?.(game.state),
              onClick: () => {
                opt.onChoose?.(game);
                if (typeof opt.jump === 'number') {
                  const j = Math.max(0, Math.min(opt.jump, scene.steps.length - 1));
                  setStep(j);
                } else if (opt.next) {
                  next();
                }
              },
            }))}
          />
        )}

        {S.type === 'quiz' && (
          <Quiz
            key={step}
            question={S.q}
            answers={S.answers}
            retryMessage={
              S.infinite ? (S.retry || 'Resposta incorreta. Tente novamente.')
                         : (S.retry || 'Resposta incorreta.')
            }
            onWrong={handleWrong}
            onCorrect={() => {
              setBanner('');
              if (S.boss) {
                next();
              } else {
                if (S.givesLife && S.flag && !game.state.flags[S.flag]) {
                  game.addLife(1);
                  game.setFlag(S.flag, true);
                }
                next();
              }
            }}
          />
        )}

        {banner && (
          <div
            className="banner"
            style={{
              maxWidth: 1100,
              margin: '10px auto',
              padding: '12px 16px',
              borderRadius: 14,
              border: '1px solid #1e293b',
              background: '#0b1220cc',
              color: '#fca5a5',
              lineHeight: 1.5,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {banner}
          </div>
        )}
      </div>
    </div>
  );
}
