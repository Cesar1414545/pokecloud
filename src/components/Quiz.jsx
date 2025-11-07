import React, { useState, useEffect } from 'react';

/**
 * props:
 * - question: string
 * - answers: [{ label, correct }]
 * - onCorrect: () => void
 * - onWrong?: () => void
 * - retryMessage?: string
 */
export default function Quiz({ question, answers, onCorrect, onWrong, retryMessage = 'Resposta incorreta.' }) {
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setFeedback('');
  }, [question]);

  function click(idx) {
    const a = answers[idx];
    if (a.correct) {
      setFeedback('Correto!');
      onCorrect?.();
    } else {
      setFeedback(retryMessage);
      onWrong?.();
    }
  }

  return (
    <div className="quiz">
      <div className="q">{question}</div>
      <div className="a">
        {answers.map((a, i) => (
          <button key={i} onClick={() => click(i)} className="answer">{a.label}</button>
        ))}
      </div>
      {feedback && <div className="feedback">{feedback}</div>}
    </div>
  );
}
