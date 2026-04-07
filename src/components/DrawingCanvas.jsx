import { useRef, useEffect, useState, useCallback } from 'react';
import { f } from '../utils/constants';

export default function DrawingCanvas({ initialData = null, onChange, height = 220 }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // pen | eraser
  const [color, setColor] = useState('#a78bfa');
  const [size, setSize] = useState(3);
  const lastPos = useRef(null);

  // Load initial data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !initialData) return;
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = initialData;
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    setDrawing(true);
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#0f1115' : color;
    ctx.lineWidth = tool === 'eraser' ? size * 6 : size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPos.current = pos;
  }, [drawing, tool, color, size]);

  const endDraw = useCallback(() => {
    if (!drawing) return;
    setDrawing(false);
    lastPos.current = null;
    // Export as base64 and notify parent
    const canvas = canvasRef.current;
    onChange?.(canvas.toDataURL('image/png'));
  }, [drawing, onChange]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange?.(null);
  };

  const COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#f87171', '#e2e8f0'];

  return (
    <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {/* Tool buttons */}
        <button
          onClick={() => setTool('pen')}
          style={{ background: tool === 'pen' ? '#7c3aed22' : 'none', border: `1px solid ${tool === 'pen' ? '#7c3aed' : 'var(--border)'}`, borderRadius: 7, padding: '4px 10px', cursor: 'pointer', color: tool === 'pen' ? '#a78bfa' : 'var(--text-secondary)', fontSize: 12, fontFamily: f }}
        >
          ✏️ Pen
        </button>
        <button
          onClick={() => setTool('eraser')}
          style={{ background: tool === 'eraser' ? '#7c3aed22' : 'none', border: `1px solid ${tool === 'eraser' ? '#7c3aed' : 'var(--border)'}`, borderRadius: 7, padding: '4px 10px', cursor: 'pointer', color: tool === 'eraser' ? '#a78bfa' : 'var(--text-secondary)', fontSize: 12, fontFamily: f }}
        >
          🧹 Eraser
        </button>

        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

        {/* Colors */}
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => { setColor(c); setTool('pen'); }}
            style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: color === c && tool === 'pen' ? '2px solid white' : '2px solid transparent', cursor: 'pointer', padding: 0 }}
          />
        ))}

        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

        {/* Size */}
        <input
          type="range"
          min={1}
          max={16}
          value={size}
          onChange={e => setSize(Number(e.target.value))}
          style={{ width: 64, accentColor: '#7c3aed', cursor: 'pointer' }}
        />

        <div style={{ flex: 1 }} />

        <button
          onClick={clearCanvas}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontFamily: f }}
        >
          Clear
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={height * 2}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        style={{
          display: 'block',
          width: '100%',
          height,
          cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          background: '#0f1115',
          touchAction: 'none',
        }}
      />
    </div>
  );
}
