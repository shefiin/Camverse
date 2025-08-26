
const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');
const requiredInputs = document.querySelectorAll('.requiredFields');
const submitBtn = document.getElementById('submitBtn');


emailInput.addEventListener('blur', () => {
    const emailValue = emailInput.value.trim();

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

    if(!isValid) {
    emailInput.classList.remove('focus:ring-blue-400');
    emailInput.classList.add('ring-2', 'ring-red-400');
    emailError.classList.remove('hidden');
    }
});  

emailInput.addEventListener('click', () => {
    emailInput.classList.remove('focus:ring-red-400', 'ring-2');
    emailInput.classList.add('focus:ring-blue-400');
    emailError.classList.add('hidden');
});



function checkAllFieldsFilled() {
    let allFilled = true;

    requiredInputs.forEach(input => {
    if (input.value.trim() === '' || !input.checkValidity()) {
        allFilled = false;
    }
    });

    if (allFilled) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('bg-gray-100', 'text-gray-300', 'cursor-not-allowed');
    submitBtn.classList.add('bg-gray-800', 'text-white', 'cursor-pointer');
    } else {
    submitBtn.disabled = true;
    submitBtn.classList.remove('bg-gray-800', 'text-white', 'cursor-pointer');
    submitBtn.classList.add('bg-gray-100', 'text-gray-300', 'cursor-not-allowed');
    }
}

requiredInputs.forEach(input => {
    input.addEventListener('input', checkAllFieldsFilled);
});

passwordInput.addEventListener('input', checkAllFieldsFilled);

