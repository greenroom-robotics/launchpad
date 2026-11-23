import { useEffect, useState } from 'react';

export interface ConnectedGamepad {
  index: number;
  id: string;
  mapping: GamepadMappingType;
}

const snapshot = (): ConnectedGamepad[] =>
  Array.from(navigator.getGamepads())
    .filter((g): g is Gamepad => g !== null)
    .map((g) => ({ index: g.index, id: g.id, mapping: g.mapping }));

/**
 * Passively lists connected gamepads so they can be checked against the supported list.
 */
export const useConnectedGamepads = (): ConnectedGamepad[] => {
  const [gamepads, setGamepads] = useState<ConnectedGamepad[]>(snapshot);

  useEffect(() => {
    const refresh = () => setGamepads(snapshot());
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('gamepadconnected', refresh);
    window.addEventListener('gamepaddisconnected', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibility);
    refresh();
    return () => {
      window.removeEventListener('gamepadconnected', refresh);
      window.removeEventListener('gamepaddisconnected', refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return gamepads;
};
