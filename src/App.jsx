import { useState } from "react";
import "./App.css";
import MainFrame from "./MainFrame";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <MainFrame />
    </>
  );
}

export default App;
