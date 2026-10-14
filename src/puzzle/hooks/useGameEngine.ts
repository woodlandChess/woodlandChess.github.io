import { useEffect, useRef, useSyncExternalStore } from 'react';
import { GameEngine } from '../core/GameEngine';

export function useGameEngine() {
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;
  const snapshot = useSyncExternalStore(engine.subscribe.bind(engine), engine.getSnapshot);
  useEffect(() => () => engine.dispose(), [engine]);
  return { engine, snapshot };
}
