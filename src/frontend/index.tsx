import React from 'react';
import { createRoot } from 'react-dom/client';
import App from "./app";

document.body.innerHTML = '<div id="app"></div>'

const root = createRoot(document.getElementById('app') as HTMLElement)
root.render(<App/>)
