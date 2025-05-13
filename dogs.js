const dogImage = document.getElementById('dog-image');
const breedInfo = document.getElementById('breed-info');
const breedButtonsContainer = document.getElementById('breed-buttons');

let dogBreeds = [];
let imageUrls = [];
let currentIndex = 0;
let carouselInterval = null;
let currentBreedLabel = 'Random';

function loadRandomImages() {
  fetch('https://dog.ceo/api/breeds/image/random/10')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        imageUrls = data.message;
        currentIndex = 0;
        updateDogImage();
        startCarousel();
        breedInfo.innerText = `Breed: ${capitalize(currentBreedLabel)}`;
      } else {
        breedInfo.innerText = 'Failed to load dog images.';
      }
    })
    .catch(() => {
      breedInfo.innerText = 'Error fetching dog images.';
    });
}

function updateDogImage() {
  if (imageUrls.length > 0) {
    dogImage.src = imageUrls[currentIndex];
  }
}

function startCarousel() {
  if (carouselInterval) clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % imageUrls.length;
    updateDogImage();
  }, 3000);
}

function createBreedButtons() {
  const allBreeds = [];
  let currentPage = 1;

  function fetchNextPage() {
    fetch(`https://dogapi.dog/api/v2/breeds?page[number]=${currentPage}`)
      .then(res => res.json())
      .then(data => {
        allBreeds.push(...data.data);

        if (data.meta.pagination && data.meta.pagination.next) {
          currentPage++;
          fetchNextPage(); // fetch next page recursively
        } else {
          const randomBreeds = getRandomItems(allBreeds, 10);
          dogBreeds = randomBreeds;

          randomBreeds.forEach(breed => {
            const breedName = breed.attributes.name;
            const button = document.createElement('button');
            button.innerText = breedName;
            button.setAttribute('class', 'button-45');
            button.addEventListener('click', () => {
              showBreedInfo(breed);
            });
            breedButtonsContainer.appendChild(button);
          });

          setupVoiceCommands();
        }
      })
      .catch(err => {
        console.error('Error fetching breed data:', err);
      });
  }

  fetchNextPage(); // Start fetching
}

function getRandomItems(arr, n) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function showBreedInfo(breed) {
  currentBreedLabel = breed.attributes.name;
  breedInfo.innerHTML = `
    <strong>Breed:</strong> ${breed.attributes.name}<br>
    <strong>Description:</strong> ${breed.attributes.description || 'No description available.'}<br>
    <strong>Min Life Span:</strong> ${breed.attributes.life.min} years<br>
    <strong>Max Life Span:</strong> ${breed.attributes.life.max} years
  `;
}

function setupVoiceCommands() {
  if (!annyang) return;

  const commands = {
    'show *spoken': (spoken) => {
      handleBreedCommand(spoken);
    }
  };

  annyang.addCommands(commands);
}

function handleBreedCommand(spoken) {
  const cleaned = spoken.toLowerCase().replace(/dog|breed/g, '').trim();

  const matchedBreed = dogBreeds.find(b =>
    b.attributes.name.toLowerCase().includes(cleaned)
  );

  if (matchedBreed) {
    showBreedInfo(matchedBreed);
  } else {
    breedInfo.innerText = `Sorry, couldn't find "${spoken}". Try one of: ${dogBreeds.map(b => b.attributes.name).join(', ')}`;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize
createBreedButtons();
loadRandomImages();