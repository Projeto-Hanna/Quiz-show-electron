interface Window {
  electron: {
    exitApp: () => void;
    openExternal: (url: string) => void
  };
}
