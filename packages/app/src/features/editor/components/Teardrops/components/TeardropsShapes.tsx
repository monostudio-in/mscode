// src/features/editor/components/Teardrops/TeardropsShapes.tsx
export const ACCENT  = 'var(--ms-accent-color, #007acc)';
export const DROP_W  = 32;
export const DROP_H  = 36;

export const CursorDropSVG = ({ style = {} }) => (
  <svg
    width={DROP_W}
    height={DROP_H}
    viewBox="0 0 24 32"
    style={{ display: 'block', transform: 'translateX(1px)' , ...style }}
  >
    <path
      d="M12 0 
         C18 6, 24 12, 24 18 
         A12 12 0 1 1 0 18 
         C0 12, 6 6, 12 0 Z"
      fill={ACCENT}
    />
  </svg>
);
export const StartDropSVG = () => (
  <CursorDropSVG
    style={{
      transform: 'rotate(45deg)',
      transformOrigin: '60% 50%',
    }}
  />
);

export const EndDropSVG = () => (
  <CursorDropSVG
    style={{
      transform: 'rotate(-45deg)',
      transformOrigin: '40% 60%',
    }}
  />
);