import React from 'react';

export default function DialogueBox({ name, text, onNext, children }){
  return (
    <div className="dialogue">
      <div className="name">{name}</div>
      <div className="text">{text}</div>
      {children}
      {onNext && (
        <div className="actions">
          <button onClick={onNext}>Continuar</button>
        </div>
      )}
    </div>
  );
}