import React from 'react';

export default function ChoiceList({ options }){
  return (
    <div className="choices">
      {options.map((o, i) => (
        <button key={i} className="choice" onClick={o.onClick} disabled={o.disabled}>
          {o.label}
        </button>
      ))}
    </div>
  );
}