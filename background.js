chrome.commands.onCommand.addListener(function (command) {
  if (command === "copy-text") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];

      chrome.tabs.executeScript(tab.id, {
        code: `
    function showModal(message) {
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.zIndex = '9999';
      modal.style.background = '#fff';
      modal.style.padding = '20px';
      modal.style.borderRadius = '10px';
      modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      modal.style.display = 'flex';
      modal.style.flexDirection = 'column';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.padding = '50px 120px';

      const messageEl = document.createElement('p');
      messageEl.textContent = message;
      messageEl.style.margin = '0';
      messageEl.style.textAlign = 'center';
      messageEl.style.marginBottom = '20px';

      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.style.background = '#fff';
      closeButton.style.border = '1px solid #000';
      closeButton.style.borderRadius = '5px';
      closeButton.style.padding = '5px 10px';
      closeButton.style.cursor = 'pointer';
      closeButton.onclick = function() {
        modal.style.display = 'none';
      };

      modal.appendChild(messageEl);
      modal.appendChild(closeButton);
      document.body.appendChild(modal);
    }

    function stripNonTextContent(str) {
      // Remove all HTML tags and attributes
      str = str.replace(/<[^>]*>/g, '');
      // Remove all JavaScript code and CSS styles
      str = str.replace(/<script[^>]*>([\\s\\S]*?)<\\/script>/gi, '');
      str = str.replace(/<style[^>]*>([\\s\\S]*?)<\\/style>/gi, '');
      // Remove all blank or empty lines
      str = str.replace(/^\\s*$\\n/gm, '');
      
      // Remove lines that contain only tabs
      str = str.replace(/^\\t+$/gm, '');

      // Remove lines that contain only special characters
      str = str.replace(/^[ !"#$%&'()*+,-./:;<=>?@[\\\\]^_\`{|}~]*$/gm, '');

      // Remove commented code within <!-- -->
      str = str.replace(/<!--([\\s\\S]*?)-->/gm, '');

      // Remove all duplicated blank lines
      str = str.replace(/\\n{2,}/g, '\\n');
      return str.trim();
    }

    try {
        let elem = document.activeElement;
        const iframe = elem.tagName.toLowerCase() === 'iframe' ? elem : elem.closest('iframe');
        if (iframe) {
          const iframeDoc = iframe.contentWindow.document;
          iframeDoc.body.focus();
          elem = iframeDoc.activeElement;
        }
        
        let str = elem.innerText || elem.textContent;
        if (elem.tagName.toLowerCase() === 'select') {
          const options = elem.options;
          str = Array.from(options).map(option => option.text).join('\\n');
        } else if (elem.tagName.toLowerCase() === 'li'){
          const siblings = Array.from(elem.parentNode.children);
          const lis = siblings.filter(sibling => sibling.tagName.toLowerCase() === 'li');
          str = lis.map(li => li.innerText || li.textContent).join('\\n');
        } else if (elem.tagName.toLowerCase() === 'a' && elem.parentElement.tagName.toLowerCase() === 'li') {
          const liParent = elem.parentElement;
          const ulParent = liParent.parentElement;
          const lis = Array.from(ulParent.children).filter(child => child.tagName.toLowerCase() === 'li');
          str = lis.map(li => li.innerText || li.textContent).join('\\n');
        }

        str = stripNonTextContent(str);
        
        if (str) {
          navigator.clipboard.writeText(str);
          showModal('Copied to clipboard :-)');
        } else {
          showModal('No text to copy! :-o');
        }
     
    }
    catch(error) {
        showModal('Cannot copy selected element. It may be protected by cross-origin policies.');
    }
  `,
      }); //execute
    }); //query
  }
});
