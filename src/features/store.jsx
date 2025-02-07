import { configureStore } from "@reduxjs/toolkit";
import themeSliceReducer from "./themeSlice.jsx";
import refreshSidebar from "./refreshSidebar.jsx";

export const store = configureStore({
  reducer: {
    themeKey: themeSliceReducer,
    refreshKey: refreshSidebar,
  },
});
