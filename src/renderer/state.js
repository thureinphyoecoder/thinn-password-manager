export const AppState = {
  current: null,
};

export function setState(state) {
  AppState.current = state;
}
