# Setup Notes

Personal notes on how this project (ViewTube) was set up, step by step.

## 1. Create the Project

```bash
npm create vite@latest viewTube -- --template react-ts
cd viewTube
npm install
```

## 2. Install Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

**`vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // add this
  ],
});
```

**`index.css`**

```css
@import "tailwindcss";
```

## 3. Creating Components

Use the `rafce` snippet (Reactjs code snippets extension) to scaffold a new arrow function component with export.

## 4. Add Redux Toolkit

```bash
npm install @reduxjs/toolkit react-redux
```

**`store.tsx`**

```tsx
const store = configureStore({
  reducer: {
    app: reducers,
  },
});

export default store;
```

**`appSlice.tsx`**

```tsx
import { createSlice } from "@reduxjs/toolkit";

interface IappState {
  isMenuOpen: boolean;
}

const initialState: IappState = {
  isMenuOpen: true,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen;
    },
  },
});

export const { toggleMenu } = appSlice.actions;
export default appSlice.reducer;
```

**`app.tsx`**

```
 <Provider store={store}>
      <Body />
  </Provider>
```

**`component.tsx`**

```
const dispatch = useDispatch();

dispatch(toggleMenu());

 const isToggle = useSelector((store: AppState) => store.app.isMenuOpen);

```

## 4. Add React Router

```bash
npm install react-router-dom
```
