'use client'
import { useState, useEffect, useCallback } from 'react';

export type SectionName = 'home' | 'projects' | 'contact';

interface SectionState {
  activeSection: SectionName;
  previousSection?: SectionName;
  isTransitioning: boolean;
  transitionProgress: number;
  sectionLoadingStates: Record<SectionName, boolean>;
}

interface UseSectionTransitionReturn {
  sectionState: SectionState;
  setActiveSection: (section: SectionName) => void;
  setSectionLoading: (section: SectionName, loading: boolean) => void;
  isCurrentSectionLoading: boolean;
}

export const useSectionTransition = (
  initialSection: SectionName = 'home',
  transitionDuration: number = 600
): UseSectionTransitionReturn => {
  const [sectionState, setSectionState] = useState<SectionState>({
    activeSection: initialSection,
    previousSection: undefined,
    isTransitioning: false,
    transitionProgress: 0,
    sectionLoadingStates: {
      home: false,
      projects: false,
      contact: false
    }
  });

  const setActiveSection = useCallback((newSection: SectionName) => {
    if (newSection === sectionState.activeSection) return;

    setSectionState(prev => ({
      ...prev,
      previousSection: prev.activeSection,
      activeSection: newSection,
      isTransitioning: true,
      transitionProgress: 0
    }));

    // Simulate transition progress
    const progressInterval = setInterval(() => {
      setSectionState(prev => {
        const newProgress = prev.transitionProgress + (100 / (transitionDuration / 50));
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return {
            ...prev,
            isTransitioning: false,
            transitionProgress: 100
          };
        }
        return {
          ...prev,
          transitionProgress: newProgress
        };
      });
    }, 50);

    // Complete transition after duration
    setTimeout(() => {
      setSectionState(prev => ({
        ...prev,
        isTransitioning: false,
        transitionProgress: 100
      }));
    }, transitionDuration);

  }, [sectionState.activeSection, transitionDuration]);

  const setSectionLoading = useCallback((section: SectionName, loading: boolean) => {
    setSectionState(prev => ({
      ...prev,
      sectionLoadingStates: {
        ...prev.sectionLoadingStates,
        [section]: loading
      }
    }));
  }, []);

  const isCurrentSectionLoading = sectionState.sectionLoadingStates[sectionState.activeSection];

  // Reset transition progress when not transitioning
  useEffect(() => {
    if (!sectionState.isTransitioning) {
      const timer = setTimeout(() => {
        setSectionState(prev => ({
          ...prev,
          transitionProgress: 0
        }));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sectionState.isTransitioning]);

  return {
    sectionState,
    setActiveSection,
    setSectionLoading,
    isCurrentSectionLoading
  };
};