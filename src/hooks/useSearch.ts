import { useState, useCallback } from 'react';
import { SearchState, SearchActions } from '@/types/search.interface';

export const useSearch = () => {
  const [state, setState] = useState<SearchState>({
    searchTerm: '',
    suggestions: [],
    selectedIndex: -1,
    isSearchFocused: false,
  });

  const actions: SearchActions = {
    setSearchTerm: useCallback((term: string) => {
      setState((prev) => ({ ...prev, searchTerm: term }));
    }, []),
    setSuggestions: useCallback((suggestions: string[]) => {
      setState((prev) => ({ ...prev, suggestions }));
    }, []),
    setSelectedIndex: useCallback((index: number) => {
      setState((prev) => ({ ...prev, selectedIndex: index }));
    }, []),
    setIsSearchFocused: useCallback((focused: boolean) => {
      setState((prev) => ({ ...prev, isSearchFocused: focused }));
    }, []),
  };

  const handleSearch = (term: string) => {
    actions.setSearchTerm(term);
    if (!term.trim()) {
      actions.setSuggestions([]);
      return;
    }

    chrome.runtime.sendMessage({ type: 'GET_SUGGESTIONS', query: term }, (response) => {
      if (response.suggestions) {
        actions.setSuggestions(response.suggestions.slice(0, 7));
      } else {
        actions.setSuggestions([]);
      }
    });
  };

  const resetSearch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      searchTerm: '',
      suggestions: [],
      selectedIndex: -1,
      isSearchFocused: false,
    }));
  }, []);

  const executeSearch = (query: string) => {
    chrome.tabs
      .create({
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      })
      .then(() => {
        resetSearch();
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (state.suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        actions.setSelectedIndex(
          state.selectedIndex < state.suggestions.length - 1 ? state.selectedIndex + 1 : state.selectedIndex,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        actions.setSelectedIndex(state.selectedIndex > 0 ? state.selectedIndex - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (state.selectedIndex >= 0) {
          executeSearch(state.suggestions[state.selectedIndex]);
          resetSearch();
        } else {
          executeSearch(state.searchTerm);
          resetSearch();
        }
        break;
      case 'Escape':
        actions.setIsSearchFocused(false);
        actions.setSelectedIndex(-1);
        break;
    }
  };

  return {
    ...state,
    ...actions,
    handleSearch,
    executeSearch,
    handleKeyDown,
    resetSearch,
  };
};
