function buildNumbersMap(words, rows, cols) {
  const map = Array.from({length: rows}, () => Array(cols).fill(null));
  words.forEach(w => {
    if (w.orientation !== 'none') {
      map[w.starty - 1][w.startx - 1] = w.position;
    }
  });
  return map;
}

function renderGrid(layout) {
  const grid = layout.table;
  const numbers = buildNumbersMap(layout.result, layout.rows, layout.cols);
  const table = document.createElement('table');
  table.className = 'crossword-grid';

  for (let i = 0; i < grid.length; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < grid[i].length; j++) {
      const td = document.createElement('td');
      if (grid[i][j] !== '-') {
        td.className = 'cell';
        const input = document.createElement('input');
        input.maxLength = 1;
        td.appendChild(input);
        if (numbers[i][j]) {
          td.setAttribute('data-number', numbers[i][j]);
        }
      } else {
        td.className = 'blank';
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  const container = document.getElementById('crossword');
  container.innerHTML = '';
  container.appendChild(table);
}

function renderClues(words) {
  const list = document.getElementById('clues-list');
  list.innerHTML = '';
  words
    .filter(w => w.orientation !== 'none')
    .sort((a, b) => a.position - b.position)
    .forEach(w => {
      const li = document.createElement('li');
      const orientation = w.orientation === 'across' ? 'horiz.' : 'vert.';
      li.textContent = `${w.position}. (${orientation}) ${w.clue}`;
      list.appendChild(li);
    });
}

function generateForLevel(level) {
  const data = JSON.parse(JSON.stringify(crosswordData[level] || []));
  if (!data.length) return;
  const layout = generateLayout(data);
  renderGrid(layout);
  renderClues(layout.result);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generate').addEventListener('click', () => {
    const niveau = document.getElementById('niveau').value;
    generateForLevel(niveau);
  });
  generateForLevel(document.getElementById('niveau').value);
});
