chrome.commands.onCommand.addListener(function (command) {
  if (command === "copy-text") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      chrome.tabs.executeScript(tab.id, {
        code: `
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
      return str;
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
        }

        str = stripNonTextContent(str);
        str = str.trim();
        if (str) {
          navigator.clipboard.writeText(str);
          alert('Copied to clipboard :-)');
        } else {
          alert('No text to copy! :-o');
        }
    }
    catch(error) {
        alert('Cannot copy selected element. :-(\\n\\nIt may be protected by cross-origin policies.');
    }
  `,
      });
    });
  }
});
