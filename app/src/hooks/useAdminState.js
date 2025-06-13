import { useState } from 'react';

export const VIEWS = {
  SELECTION: "selection",
  RACE_LIST: "raceList", 
  TOURNAMENT_LIST: "tournamentList",
  REORDER: "reorder"
};

const useAdminState = () => {
  const [state, setState] = useState({
    view: VIEWS.SELECTION,
    selectedItem: null,
    items: [],
    loading: false,
    error: null,
    successMessage: null
  });

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
  const resetState = () => setState({
    view: VIEWS.SELECTION,
    selectedItem: null, 
    items: [],
    loading: false,
    error: null,
    successMessage: null
  });

  return { state, updateState, resetState };
};

export default useAdminState; 