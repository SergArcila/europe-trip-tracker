import { CheckIcon } from './Icons';

export default function Checkbox({ on, color, sz = 22, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: sz, height: sz, minWidth: sz,
        borderRadius: sz > 20 ? 7 : 6,
        border: on ? 'none' : `2px solid ${color}55`,
        background: on ? color : 'transparent',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s',
        marginTop: 1,
        flexShrink: 0,
      }}
    >
      {on && <CheckIcon />}
    </button>
  );
}
