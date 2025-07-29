const input = document.querySelector('#inputWord');
const btn = document.querySelector('#searchBtn');
const dictionaryArea = document.querySelector('.dictionary-app');
const resetBtn = document.getElementById('searchAnother');

async function dictionaryFn(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data[0];
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

btn.addEventListener('click', fetchAndCreateCard);
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') fetchAndCreateCard();
});

resetBtn.addEventListener('click', () => {
  input.value = '';
  dictionaryArea.innerHTML = '';
  input.focus();
  resetBtn.style.display = 'none';
});

async function fetchAndCreateCard() {
  const word = input.value.trim();
  if (!word) return;

  const data = await dictionaryFn(word);

  if (!data || data.title === "No Definitions Found") {
    dictionaryArea.innerHTML = `
      <div class="card">
        <div class="property">
          <span>Error:</span>
          <span>Word not found or API error.</span>
        </div>
      </div>`;
    input.value = '';
    input.focus();
    resetBtn.style.display = 'inline-block';
    return;
  }

  const meanings = data.meanings;

  const allSynonyms = Array.from(new Set(
    meanings.flatMap(m =>
      (m.synonyms || []).concat(...m.definitions.map(d => d.synonyms || []))
    )
  ));

  const allAntonyms = Array.from(new Set(
    meanings.flatMap(m =>
      (m.antonyms || []).concat(...m.definitions.map(d => d.antonyms || []))
    )
  ));

  const firstMeaning = meanings[0];
  const definitions = firstMeaning.definitions || [];
  const audioSrc = (data.phonetics.find(p => p.audio)?.audio || '');

  const definitionListHTML = definitions.slice(0, 5)
    .map(def => `<li class="definition-item">${def.definition}</li>`)
    .join('');

  const synonymHTML = allSynonyms.length
    ? allSynonyms.map(s => `<span class="synonym-tag">${s}</span>`).join('')
    : 'No synonyms available.';

  const antonymHTML = allAntonyms.length
    ? allAntonyms.map(a => `<span class="antonym-tag">${a}</span>`).join('')
    : 'No antonyms available.';

  dictionaryArea.innerHTML = `
    <div class="card">
      <div class="property">
        <span>Word:</span>
        <span>${data.word}</span>
      </div>
      <div class="property">
        <span>Phonetic:</span>
        <span>${data.phonetic || "Not available"}</span>
      </div>
      <div class="property">
        <span>Audio:</span>
        ${audioSrc ? `<audio controls src="${audioSrc}"></audio>` : "Not available"}
      </div>
      <div class="property">
        <span>Definitions:</span>
        <ul>${definitionListHTML}</ul>
      </div>
      <div class="property">
        <span>Example:</span>
        <span>${definitions[0]?.example || "No example available."}</span>
      </div>
      <div class="property">
        <span>Parts of Speech:</span>
        <span>${firstMeaning.partOfSpeech}</span>
      </div>
      <div class="property">
        <span>Synonyms:</span>
        <div class="synonyms">${synonymHTML}</div>
      </div>
      <div class="property">
        <span>Antonyms:</span>
        <div class="antonyms">${antonymHTML}</div>
      </div>
    </div>`;

  input.value = '';
  input.focus();
  resetBtn.style.display = 'inline-block';
}
