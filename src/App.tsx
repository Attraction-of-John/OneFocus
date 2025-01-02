import { useState } from 'react';
function App() {
  const [count, setCount] = useState(0);
  const [color, setColor] = useState("black");

  const onClick = async () => {
    const [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript<string[], void>({
      target: { tabId: tab.id! },
      args: [color],
      func: (color) => {
        document.body.style.backgroundColor = color;
      },
    });
  };
  return (
    <div>
      <div>
        <a href="https://vite.dev" target="_blank">
          vite
        </a>
      </div>
      <h1>Vite + React</h1>
      <input type="color" onChange={(e) => setColor(e.currentTarget.value)} />
      <button onClick={onClick}>Click Me</button>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
