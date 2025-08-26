document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-toggle');
    const menu = document.getElementById('sidebar');

    menuBtn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });


    const input = document.getElementById('images');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const removePreviewBtn = document.getElementById('removePreviewBtn');
    const imageInput = document.getElementById('images');
    const imageError = document.getElementById('imageError');
    const imageContainer = document.getElementById('imageContainer');
    const maxImages = 1

    let imageFiles = []; 
    let currentPreviewIndex = 0;

    input.addEventListener('change', () => {
        imageFiles = Array.from(input.files);
        if (imageFiles.length === 0) return;

        renderThumbnails();
        showPreview(0);
    });


    function renderThumbnails() {
        thumbnailContainer.innerHTML = '';

        imageFiles.forEach((file, index) => {
            const thumbReader = new FileReader();
            thumbReader.onload = e => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = "w-10 h-10 object-cover rounded-md border border-white shadow-md cursor-pointer";
                img.title = file.name;
                img.dataset.index = index;

                img.addEventListener('click', () => {
                    currentPreviewIndex = parseInt(img.dataset.index);
                    showPreview(currentPreviewIndex);
                });

                thumbnailContainer.appendChild(img);
            };
            thumbReader.readAsDataURL(file);
        });
    }

    function showPreview(index) {
        const file = imageFiles[index];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            previewImage.src = e.target.result;
            previewContainer.classList.remove('hidden');
            currentPreviewIndex = index;
        };
        reader.readAsDataURL(file);
    }


    removePreviewBtn.addEventListener('click', () => {
        
        imageFiles.splice(currentPreviewIndex, 1);
        renderThumbnails();

        if (imageFiles.length > 0) {
            const nextIndex = currentPreviewIndex >= imageFiles.length ? imageFiles.length - 1 : currentPreviewIndex;
            showPreview(nextIndex);
        } else {
            previewImage.src = '';
            previewContainer.classList.add('hidden');
        }

        if(imageFiles.length <= maxImages) {
            imageContainer.classList.remove('border-red-500');
            imageError.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
            submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            
        }
    });


    const form = document.querySelector('form');
    const submitBtn = document.getElementById('addProductBtn');
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const nameInput = document.getElementById('name')
    const descriptionInput = document.getElementById('description')
    const nameError = document.getElementById('nameError');
    const descError = document.getElementById('descError');
    
   
  

    function validateForm() {
        let isValid = true;

        const nameValue = nameInput.value.trim();
        const descValue = descriptionInput.value.trim();
    
        inputs.forEach(input => {
            if (!input.value.trim()){
                isValid = false;
                
            }
            if(nameValue.length > 25) {
                isValid = false;
                nameError.classList.remove('hidden');
                nameInput.classList.remove('focus:ring-blue-500');
                nameInput.classList.add('focus:ring-red-500');
                
            } else{
                nameError.classList.add('hidden');
                nameInput.classList.remove('focus:ring-red-500');
                nameInput.classList.add('focus:ring-blue-500');                      
            }
            if(descValue.length > 5000) {
                isValid = false;
                descError.classList.remove('hidden');
                descriptionInput.classList.remove('focus:ring-blue-500');
                descriptionInput.classList.add('focus:ring-red-500');
            } else {
                descError.classList.add('hidden');
                descriptionInput.classList.remove('focus:ring-red-500');
                descriptionInput.classList.add('focus:ring-blue-500');
            }   
        });


        if(imageInput.files.length > maxImages) {
            isValid = false;
            imageContainer.classList.add('border-red-500');
            imageError.textContent = `Only ${maxImages} image allowed. You selected ${imageInput.files.length}.`;
            imageError.classList.remove('hidden');
        } else {
            for (const file of imageInput.files) {
                if(!allowedTypes.includes(file.type)) {
                    isValid = false;
                    imageContainer.classList.add('border-red-500');
                    imageError.textContent = 'Only .jpeg .png .webp images are allowed';
                    imageError.classList.remove('hidden');
                    break;
                }             
            }

            if(isValid) {
                imageError.textContent = '';
                imageContainer.classList.remove('border-red-500');
                imageError.classList.add('hidden');
            }
        }


        if(isValid) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
            submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            submitBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
        }
    }

    inputs.forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('change', validateForm);

    });


    validateForm();

    if (success === '1') {
        const message = document.getElementById('successMessage');
        message.classList.remove('hidden');

        setTimeout(() => {
        message.classList.add('hidden');
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        }, 2000); 

    }

})

