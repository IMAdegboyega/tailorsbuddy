import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export type IconName =
  | 'users'
  | 'dollar'
  | 'settings'
  | 'plus'
  | 'search'
  | 'chevronRight'
  | 'chevronLeft'
  | 'arrowRight'
  | 'upload'
  | 'pencil'
  | 'eraser'
  | 'undo'
  | 'redo'
  | 'trash'
  | 'download'
  | 'send'
  | 'check'
  | 'eye'
  | 'maximize'
  | 'minimize'
  | 'sliders';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Feather-style line icons, ported 1:1 from the inline SVGs in the prototype.
 * Each entry renders inside a 24x24 viewBox with fill="none".
 */
export function Icon({ name, size = 21, color = '#BE8A5A', strokeWidth = 1.4 }: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'users' && (
        <>
          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...common} />
          <Circle cx={9} cy={7} r={4} {...common} />
          <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...common} />
        </>
      )}
      {name === 'dollar' && (
        <Path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" {...common} />
      )}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={3} {...common} />
          <Path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            {...common}
          />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...common} />}
      {name === 'search' && (
        <>
          <Circle cx={11} cy={11} r={7} {...common} />
          <Path d="M21 21l-4.3-4.3" {...common} />
        </>
      )}
      {name === 'chevronRight' && <Path d="M9 18l6-6-6-6" {...common} />}
      {name === 'chevronLeft' && <Path d="M15 18l-6-6 6-6" {...common} />}
      {name === 'arrowRight' && <Path d="M5 12h14M13 6l6 6-6 6" {...common} />}
      {name === 'upload' && <Path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3M12 3v13M8 7l4-4 4 4" {...common} />}
      {name === 'pencil' && (
        <Path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" {...common} />
      )}
      {name === 'eraser' && (
        <>
          <Path d="M20 20H7L3 16a2 2 0 0 1 0-3l9-9a2 2 0 0 1 3 0l5 5a2 2 0 0 1 0 3l-8 8" {...common} />
          <Path d="M9 11l5 5" {...common} />
        </>
      )}
      {name === 'undo' && (
        <>
          <Path d="M9 14l-4-4 4-4" {...common} />
          <Path d="M5 10h11a4 4 0 0 1 0 8h-1" {...common} />
        </>
      )}
      {name === 'redo' && (
        <>
          <Path d="M15 14l4-4-4-4" {...common} />
          <Path d="M19 10H8a4 4 0 0 0 0 8h1" {...common} />
        </>
      )}
      {name === 'trash' && (
        <Path
          d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
          {...common}
        />
      )}
      {name === 'download' && <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" {...common} />}
      {name === 'send' && <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" {...common} />}
      {name === 'check' && <Path d="M20 6L9 17l-5-5" {...common} />}
      {name === 'eye' && (
        <>
          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...common} />
          <Circle cx={12} cy={12} r={3} {...common} />
        </>
      )}
      {name === 'maximize' && <Path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" {...common} />}
      {name === 'minimize' && <Path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" {...common} />}
      {name === 'sliders' && (
        <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" {...common} />
      )}
    </Svg>
  );
}
