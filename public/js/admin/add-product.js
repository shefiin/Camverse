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
    const maxImages = 10

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
    const priceInput = document.getElementById('price');
    const mrpInput = document.getElementById('mrp')
    const stockInput = document.getElementById('stock');
    const priceError = document.getElementById('priceError');
    const mrpError = document.getElementById('mrpError')
    const stockError = document.getElementById('stockError');


    function isValidPriceFormat(value) {
        return /^\d+(\.\d{1,2})?$/.test(value);
    }

    function isValidStockFormat(value) {
        return /^\d+$/.test(value);
    }

    function validateForm() {
        let isValid = true;

        const nameValue = nameInput.value.trim();
        const descValue = descriptionInput.value.trim();
        const priceValue = parseFloat(priceInput.value);
        const mrpRaw = mrpInput.value.trim();
        const mrpValue = mrpRaw === '' ? null : parseFloat(mrpRaw);
        const stockValue = parseInt(stockInput.value);
        
    
        inputs.forEach(input => {
            if (!input.value.trim()){
                isValid = false;
                
            }
            if(nameValue.length > 500) {
                isValid = false;
                nameError.classList.remove('hidden');
                nameInput.classList.remove('focus:ring-blue-500');
                nameInput.classList.add('focus:ring-red-500');
                
            } else{
                nameError.classList.add('hidden');
                nameInput.classList.remove('focus:ring-red-500');
                nameInput.classList.add('focus:ring-blue-500');                      
            }
            if(descValue.length > 2000) {
                isValid = false;
                descError.classList.remove('hidden');
                descriptionInput.classList.remove('focus:ring-blue-500');
                descriptionInput.classList.add('focus:ring-red-500');
            } else {
                descError.classList.add('hidden');
                descriptionInput.classList.remove('focus:ring-red-500');
                descriptionInput.classList.add('focus:ring-blue-500');
            }
            if(priceInput.value.trim() !== '' && (!isValidPriceFormat(priceInput.value) || priceValue < 0)) {
                isValid = false;
                priceError.classList.remove('hidden');
                priceInput.classList.remove('focus:ring-blue-500');
                priceInput.classList.add('focus:ring-red-500');
            } else {
                priceError.classList.add('hidden');
                priceInput.classList.remove('focus:ring-red-500');
                priceInput.classList.add('focus:ring-blue-500');
            }
            if(mrpValue !== null) {
                if (mrpRaw !== '') {
                    if (!isValidPriceFormat(mrpRaw) || mrpValue <= 0) {
                        isValid = false;
                        mrpError.textContent = 'MRP must be a positive number with up to 2 decimals';
                        mrpError.classList.remove('hidden');
                        mrpInput.classList.remove('focus:ring-blue-500');
                        mrpInput.classList.add('focus:ring-red-500');
                    } else if (mrpValue < priceValue) {
                        isValid = false;
                        mrpError.textContent = 'MRP must be greater than price';
                        mrpError.classList.remove('hidden');
                        mrpInput.classList.remove('focus:ring-blue-500');
                        mrpInput.classList.add('focus:ring-red-500');
                    } else {
                        mrpError.classList.add('hidden');
                        mrpInput.classList.remove('focus:ring-red-500');
                        mrpInput.classList.add('focus:ring-blue-500');
                    }
                } else {
                    
                    mrpError.classList.add('hidden');
                    mrpInput.classList.remove('focus:ring-red-500');
                    mrpInput.classList.add('focus:ring-blue-500');
                }
            }    

            if(stockInput.value.trim() !== '' && (!isValidStockFormat(stockInput.value) || stockValue < 0)) {
                isValid = false;
                stockError.classList.remove('hidden');
                stockInput.classList.remove('focus:ring-blue-500');
                stockInput.classList.add('focus:ring-red-500');
            } else {
                stockError.classList.add('hidden');
                stockInput.classList.remove('focus:ring-red-500');
                stockInput.classList.add('focus:ring-blue-500');
            }    
        });


        if(imageInput.files.length > maxImages) {
            isValid = false;
            imageContainer.classList.add('border-red-500');
            imageError.textContent = `Maximum ${maxImages} images allowed. You selected ${imageInput.files.length}.`;
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


})

