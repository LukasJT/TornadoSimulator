import { reportSimulatorEvent } from './simulator-events.js';

document.querySelector('main').addEventListener('click', event => {
  const link = event.target.closest?.('a[href]');
  if (!link || link.origin !== location.origin) return;
  if (link.pathname === '/simulator/') reportSimulatorEvent('article_to_tool', 'tornado-path');
  if (link.pathname === '/supercell-simulator/') reportSimulatorEvent('article_to_tool', 'supercell');
});
