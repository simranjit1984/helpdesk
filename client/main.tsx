import { createRoot } from "react-dom/client";
import { App } from "./App";

const root = createRoot(document.getElementById("root")!);

root.render(<App />);

if (import.meta.hot) {
  import.meta.hot.accept("./App.tsx", (newModule) => {
    root.render(<newModule.App />);
  });
}
