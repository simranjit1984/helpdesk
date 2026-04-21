import { createRoot } from "react-dom/client";
import { BaseStyling } from "@onewelcome/react-lib-components";
import { App } from "./App";

const root = createRoot(document.getElementById("root")!);

root.render(
  <BaseStyling>
    <App />
  </BaseStyling>
);

if (import.meta.hot) {
  import.meta.hot.accept("./App.tsx", (newModule) => {
    root.render(<newModule.App />);
  });
}
