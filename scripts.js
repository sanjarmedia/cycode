// #region Declare Variables

const keyLocations = {
  0: 'General keys',
  1: 'Left-side modifier keys',
  2: 'Right-side modifier keys',
  3: 'Numpad',
};

const spaceDescription = '(Space character)';

const body = document.querySelector('body');
const mobileInputDiv = document.querySelector('.mobile-input');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
ctx.textBaseline = 'middle';
ctx.textAlign = 'center';
ctx.font = '110px sans-serif';

// #endregion

// #region Main Methods

function createTable() {
  const tableBody = document.querySelector('.table-body');
  for (const key in keyCodes) {
    const row = document.createElement('tr');
    row.innerHTML += `<td>${key}</td>`;
    row.innerHTML += `<td>${keyCodes[key]}</td>`;
    tableBody.appendChild(row);
  }
}

function toggleTable() {
  const table = document.querySelector('.table');

  // Toggle main content and table
  document.querySelector('.wrap').classList.toggle('hide');
  document.querySelector('.keycode-display').classList.toggle('hide');
  table.classList.toggle('hide');

  // If hidden, show back arrow
  const hidden = table.classList.contains('hide');
  document.querySelector('.table-toggle-button').textContent = hidden ? 'Table' : '⬅';
}

function drawNumberToCanvas(number) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillText(number, canvas.width / 2, canvas.height / 2, canvas.width);
  const data = canvas.toDataURL('image/png');

  const link = document.querySelector("link[rel*='icon']");
  link.type = 'image/x-icon';
  link.href = data;
}

function createNotification(text) {
  // eslint-disable-next-line no-undef
  new Noty({
    type: 'info',
    layout: 'topLeft',
    timeout: '1500',
    theme: 'metroui',
    progressBar: false,
    text,
  }).show();
}

function createTextarea(text) {
  const textArea = document.createElement('textarea');

  // Place in top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of white box if rendered for any reason.
  textArea.style.background = 'transparent';

  textArea.value = text;

  document.body.appendChild(textArea);
  return textArea;
}

/**
 * This function is used to copy a string to clipboard
 * @param {string} text
 */
function copyTextToClipboard(text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData('Text', text);
  } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    const textArea = createTextarea(text);
    textArea.focus();
    textArea.select();

    try {
      const status = document.execCommand('copy'); // Security exception may be thrown by some browsers.
      if (status) {
        createNotification('Copied text to clipboard');
      }
      return status;
    } catch (ex) {
      console.warn('Copy to clipboard failed.', ex);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

// #endregion

// #region Event Listeners

document.addEventListener('touchstart', e => {
  if (document.querySelector('.mobile-input input') !== null) return;
  if (e.target.tagName === 'BUTTON') return;

  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  mobileInputDiv.appendChild(input);

  // For some reason, the focus is immediately lost unless there is a delay on setting the focus
  setTimeout(() => {
    input.focus();
  }, 100);
});

body.onkeydown = function(e) {
  if (!e.metaKey) {
    e.preventDefault();
  }
  drawNumberToCanvas(e.keyCode);

  // Main e.keyCode display
  document.querySelector('.keycode-display').innerHTML = e.keyCode;

  // Show the cards with all
  const cards = document.querySelector('.cards');
  cards.classList.add('active');
  cards.classList.remove('hide');
  document.querySelector('.text-display').classList.add('hide');

  // Check if Key_Values is Unidentified then redirect to docs
  let newKeyText = '';
  if (e.key != null && e.key === 'Unidentified') {
    newKeyText = '<a href="https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values#Special_values" target="_blank" rel="noopener">Unidentified</a>';
  } else if (e.key === ' ') {
    newKeyText = `<span class="text-muted">${spaceDescription}</span>`;
  } else {
    newKeyText = e.key || '';
  }

  // Check if location is Unidentified then redirect to docs
  let newLocationText = '';
  let newLocationFriendlyText = '';
  if (e.location == null) {
    newLocationFriendlyText = 'Unknown';
  } else if (!(e.location in keyLocations)) {
    newLocationFriendlyText = '<a href="https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location" target="_blank" rel="noopener">Other</a>';
  } else {
    newLocationFriendlyText = keyLocations[e.location];
  }

  if (newLocationFriendlyText !== 'Unknown') {
    newLocationText = `${e.location} <span class="text-muted">(${newLocationFriendlyText})</span>`;
  } else {
    newLocationText = newLocationFriendlyText;
  }

  // Check if code is Unidentified then redirect to docs
  let newCodeText = '';
  if (e.code != null && e.code === 'Unidentified') {
    newCodeText = '<a href="https://w3c.github.io/uievents-code/#table-key-code-special" target="_blank" rel="noopener">Unidentified</a>';
  } else {
    newCodeText = e.code || '';
  }

  // Clear input if manually entered
  const mobileInput = document.querySelector('.mobile-input input');
  if (mobileInput !== null) {
    mobileInput.value = '';
  }

  document.querySelector('.item-key .main-description').innerHTML = newKeyText;
  document.querySelector('.item-location .main-description').innerHTML = newLocationText;
  document.querySelector('.item-which .main-description').innerHTML = e.which || '';
  document.querySelector('.item-code .main-description').innerHTML = newCodeText;
};

body.onkeyup = function(e) {
  if(e.keyCode == '44') {
    body.onkeydown(e);
  }
}

const cardDivs = document.querySelectorAll('.card');
Array.from(cardDivs).forEach(card => {
  card.addEventListener('click', onCardClick);
});

function onCardClick() {
  const card = this;
  let description = card.querySelector('.card-main .main-description').innerHTML;
  description = description.replace(/<[^>]*>?/gm, '');
  if (description === spaceDescription) {
    description = ' ';
  }
  copyTextToClipboard(description);
}

// #endregion

// #region Init Methods

createTable();
drawNumberToCanvas('⌨️');

// #endregion
