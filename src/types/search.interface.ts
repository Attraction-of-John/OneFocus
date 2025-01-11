export interface SearchState {
  searchTerm: string;
  suggestions: string[];
  selectedIndex: number;
  isSearchFocused: boolean;
}

export interface SearchActions {
  setSearchTerm: (term: string) => void;
  setSuggestions: (suggestions: string[]) => void;
  setSelectedIndex: (index: number) => void;
  setIsSearchFocused: (focused: boolean) => void;
}
