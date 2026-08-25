import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';
import './styles.css';

const container = document.querySelector('#root');
if (container === null) throw new Error('#root is missing from index.html');

// No StrictMode: its double mount would fetch and pack the 16 MB corpus twice and allocate two sets
// of shared buffers, which is exactly the kind of noise this page exists to measure away.
createRoot(container).render(<App />);
