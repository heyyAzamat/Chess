import { useState, useCallback, useRef } from "react";
import { STORY_SCRIPT, type StoryMoment, type StoryTrigger } from "../narrative/storyScript";

export function useStoryScript() {
  const [_queue, setQueue]    = useState<StoryMoment[]>([]);
  const [current, setCurrent] = useState<StoryMoment | null>(null);
  const fired                 = useRef(new Set<string>());
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show next in queue
  const showNext = useCallback((q: StoryMoment[]) => {
    if (q.length === 0) { setCurrent(null); return; }
    const [next, ...rest] = q;
    setCurrent(next);
    setQueue(rest);
  }, []);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setQueue(prev => {
      const next = [...prev];
      // Show next after short gap
      setTimeout(() => showNext(next), 300);
      return [];
    });
    setCurrent(null);
  }, [showNext]);

  const trigger = useCallback((t: StoryTrigger) => {
    const moment = STORY_SCRIPT.find(m => m.trigger === t && !fired.current.has(m.id));
    if (!moment) return;
    fired.current.add(moment.id);

    setQueue(prev => {
      const newQueue = [...prev, moment];
      if (!current && prev.length === 0) {
        // Nothing showing — show immediately
        setTimeout(() => {
          setCurrent(moment);
          setQueue([]);
        }, 50);
        return [];
      }
      return newQueue;
    });
  }, [current]);

  // Auto-advance when current changes
  const onPanelReady = useCallback((durationMs: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setQueue(prev => {
        showNext(prev);
        return [];
      });
      setCurrent(null);
    }, durationMs);
  }, [showNext]);

  function reset() {
    fired.current.clear();
    setQueue([]);
    setCurrent(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return { current, trigger, dismiss, onPanelReady, reset };
}
