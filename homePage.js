// Check if Annyang is available
if (annyang) {
    // Define the voice commands
    const commands = {
      'hello': () => {
        alert('Hello world!');
      },
      'change the color to *color': (color) => {
        document.body.style.backgroundColor = color;
      },
      'navigate to *page': (page) => {
        const lowerPage = page.toLowerCase();
        if (lowerPage.includes('home')) {
          window.location.href = 'homePage.html';
        } else if (lowerPage.includes('stocks')) {
          window.location.href = 'stocks.html';
        } else if (lowerPage.includes('dogs')) {
          window.location.href = 'dogs.html';
        } else {
          alert(`Sorry, I don't recognize the page "${page}".`);
        }
      }
    };
  
    // Add commands to Annyang
    annyang.addCommands(commands);
  }