// const form = document.querySelector('form');
// const imagesInput = document.getElementById('images');
// const nameInput = document.getElementById('name');
// const brandSelect = document.getElementById('brand');
// const categorySelect = document.getElementById('category');
// const priceInput = document.getElementById('price');
// const mrpInput = document.getElementById('mrp');
// const stockInput = document.getElementById('stock');
// const descriptionInput = document.getElementById('description');
// const previewImage = document.getElementById('previewImage');
// const removePreviewBtn = document.getElementById('removePreviewBtn');
// const thumbnailContainer = document.getElementById('thumbnailContainer');
// const imageError = document.getElementById('imageError');

// let currentImages = [];

// function clearError(){
//     imageError.textContent = '';
//     imageError.classList.add('hidden');
// }

// function showError(msg) {
//     imageError.textContent = msg;
//     imageError.classList.remove('hidden');
// }

// function loadExistingImages() {
//     const thumbImgs = thumbnailContainer.querySelectorAll('img');
//     if(thumbImgs.length > 0) {
//         currentImages = Array.from(thumbImgs).map(img => img.src);
//     } else if (previewImage.src){
//         currentImages = [previewImage.src];
//     } else {
//         currentImages = [];
//     }
// }

// function renderImages() {
//     clearError();

//     if(currentImages.length === 0){
//         previewImage.src = '';
//         thumbnailContainer.innerHTML = '';
//         return;
//     }

//     previewImage.src = currentImages[0];

//     thumbnailContainer.innerHTML = '';
//     currentImages.forEach((imgSrc, index) => {
//       const img = document.createElement('img');
//       img.src = imgSrc;
//       img.className = 'w-10 h-10 object-cover rounded-md border border-white shadow-md cursor-pointer';
//       img.alt = `Product image ${index + 1}`;
//       img.dataset.index = index;
//       thumbnailContainer.appendChild(img);
//     });
// }

// thumbnailContainer.addEventListener('click', (e) => {
//     if (e.target.tagName === 'IMG') {
//       const index = Number(e.target.dataset.index);
//       if (!isNaN(index) && currentImages[index]) {
//         previewImage.src = currentImages[index];
//       }
//     }
// });

// removePreviewBtn.addEventListener('click', () => {
//     clearError();

//     const currentSrc = previewImage.src;
//     if (!currentSrc) return; // No image to remove

//     // Remove image from array
//     currentImages = currentImages.filter(src => src !== currentSrc);

//     if (currentImages.length === 0) {
//       // Clear preview and thumbnails if none left
//       previewImage.src = '';
//       thumbnailContainer.innerHTML = '';
//     } else {
//       // Show first remaining image
//       previewImage.src = currentImages[0];
//       renderImages();
//     }

//     imagesInput.value = '';
// });


// imagesInput.addEventListener('change', () => {
//     clearError();

//     const files = Array.from(imagesInput.files);

//     if (files.length === 0) {
//       // No files selected, do nothing
//       return;
//     }

//     // Check max limit
//     if (files.length > 10) {
//       showError('You can upload a maximum of 10 images only.');
//       imagesInput.value = '';
//       return;
//     }

//     // Create URLs for preview from files
//     currentImages = files.map(file => URL.createObjectURL(file));

//     // Render previews
//     renderImages();
// });

// // Initial load existing images on page load
// document.addEventListener('DOMContentLoaded', () => {
//   loadExistingImages();
//   renderImages();
// });


// form.addEventListener('submit', (e) => {
//   let valid = true;

//   document.querySelectorAll('span.text-red-500').forEach(el => el.classList.add('hidden'));
//   imageError.classList.add('hidden');

//   // Image presence validation using currentImages
//   if (currentImages.length === 0) {
//     showError('Please upload at least one image.');
//     valid = false;
//   }

//   // Name validation
//   if (!nameInput.value.trim()) {
//     document.getElementById('nameError').textContent = 'Name is required.';
//     document.getElementById('nameError').classList.remove('hidden');
//     valid = false;
//   } else if (nameInput.value.trim().length > 100) {
//     document.getElementById('nameError').textContent = 'Name too long (max 100 characters).';
//     document.getElementById('nameError').classList.remove('hidden');
//     valid = false;
//   }

//   // Brand validation
//   if (!brandSelect.value) {
//     alert('Please select a brand.');
//     valid = false;
//   }

//   // Category validation
//   if (!categorySelect.value) {
//     alert('Please select a category.');
//     valid = false;
//   }

//   // Price validation
//   const price = parseFloat(priceInput.value);
//   if (isNaN(price) || price <= 0) {
//     document.getElementById('priceError').classList.remove('hidden');
//     valid = false;
//   }

//   // MRP validation
//   const mrp = parseFloat(mrpInput.value);
//   if (isNaN(mrp) || mrp < price) {
//     document.getElementById('mrpError').classList.remove('hidden');
//     valid = false;
//   }

//   // Stock validation
//   const stock = parseInt(stockInput.value, 10);
//   if (isNaN(stock) || stock < 0) {
//     document.getElementById('stockError').classList.remove('hidden');
//     valid = false;
//   }

//   // Description validation
//   if (!descriptionInput.value.trim()) {
//     document.getElementById('descError').textContent = 'Description is required.';
//     document.getElementById('descError').classList.remove('hidden');
//     valid = false;
//   } else if (descriptionInput.value.trim().length > 500) {
//     document.getElementById('descError').textContent = 'Description too long (max 500 characters).';
//     document.getElementById('descError').classList.remove('hidden');
//     valid = false;
//   }

//   if (!valid) e.preventDefault();
// });



const form = document.querySelector('form');
const imagesInput = document.getElementById('images');
const nameInput = document.getElementById('name');
const brandSelect = document.getElementById('brand');
const categorySelect = document.getElementById('category');
const priceInput = document.getElementById('price');
const mrpInput = document.getElementById('mrp');
const stockInput = document.getElementById('stock');
const descriptionInput = document.getElementById('description');
const previewImage = document.getElementById('previewImage');
const removePreviewBtn = document.getElementById('removePreviewBtn');
const thumbnailContainer = document.getElementById('thumbnailContainer');
const imageError = document.getElementById('imageError');

// NEW: track removed images
let currentImages = [];
let removedImages = [];
const removedImagesInput = document.createElement('input');
removedImagesInput.type = 'hidden';
removedImagesInput.name = 'removedImages';
form.appendChild(removedImagesInput);

function clearError(){
    imageError.textContent = '';
    imageError.classList.add('hidden');
}

function showError(msg) {
    imageError.textContent = msg;
    imageError.classList.remove('hidden');
}

function loadExistingImages() {
    const thumbImgs = thumbnailContainer.querySelectorAll('img');
    if(thumbImgs.length > 0) {
        currentImages = Array.from(thumbImgs).map(img => img.src);
    } else if (previewImage.src){
        currentImages = [previewImage.src];
    } else {
        currentImages = [];
    }
}

function renderImages() {
    clearError();

    if(currentImages.length === 0){
        previewImage.src = '';
        thumbnailContainer.innerHTML = '';
        return;
    }

    previewImage.src = currentImages[0];

    thumbnailContainer.innerHTML = '';
    currentImages.forEach((imgSrc, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'relative';

      const img = document.createElement('img');
      img.src = imgSrc;
      img.className = 'w-10 h-10 object-cover rounded-md border border-white shadow-md cursor-pointer';
      img.alt = `Product image ${index + 1}`;
      img.dataset.index = index;

      // NEW: add remove button for each thumbnail
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'absolute -top-2 -right-2 bg-white text-gray-700 hover:text-red-600 rounded-full w-5 h-5 flex items-center justify-center shadow';
      removeBtn.innerHTML = '<i class="fa-solid fa-xmark text-xs"></i>';
      removeBtn.addEventListener('click', () => {
          removedImages.push(imgSrc);
          removedImagesInput.value = JSON.stringify(removedImages);
          currentImages = currentImages.filter(src => src !== imgSrc);
          renderImages();
      });

      wrapper.appendChild(img);
      wrapper.appendChild(removeBtn);
      thumbnailContainer.appendChild(wrapper);
    });
}

thumbnailContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
      const index = Number(e.target.dataset.index);
      if (!isNaN(index) && currentImages[index]) {
        previewImage.src = currentImages[index];
      }
    }
});

// Main preview remove
removePreviewBtn.addEventListener('click', () => {
    clearError();
    const currentSrc = previewImage.src;
    if (!currentSrc) return;

    removedImages.push(currentSrc);
    removedImagesInput.value = JSON.stringify(removedImages);

    currentImages = currentImages.filter(src => src !== currentSrc);

    if (currentImages.length === 0) {
      previewImage.src = '';
      thumbnailContainer.innerHTML = '';
    } else {
      previewImage.src = currentImages[0];
      renderImages();
    }

    imagesInput.value = '';
});

imagesInput.addEventListener('change', () => {
    clearError();
    const files = Array.from(imagesInput.files);

    if (files.length === 0) return;

    if (files.length > 10) {
      showError('You can upload a maximum of 10 images only.');
      imagesInput.value = '';
      return;
    }

    currentImages = files.map(file => URL.createObjectURL(file));
    renderImages();
});

document.addEventListener('DOMContentLoaded', () => {
  loadExistingImages();
  renderImages();
});

form.addEventListener('submit', (e) => {
  let valid = true;

  document.querySelectorAll('span.text-red-500').forEach(el => el.classList.add('hidden'));
  imageError.classList.add('hidden');

  if (currentImages.length === 0) {
    showError('Please upload at least one image.');
    valid = false;
  }

  // ... keep your other validations

  if (!valid) e.preventDefault();
});
