document.querySelectorAll('.toggle-password').forEach((eyeIcon) => {
    eyeIcon.addEventListener('click', () => {
      const input = eyeIcon.previousElementSibling;
      const icon = eyeIcon.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      }
    });
  });


  const passwordInput = document.getElementById('password');
  const passwordError = document.getElementById('passwordError');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const confirmPasswordError = document.getElementById('confirmPasswordError');
  const confirmPasswordIcon = document.getElementById('confirmPasswordIcon');
  const confirmPasswordMessage = document.getElementById('confirmPasswordMessage');
  const requiredInputs = document.querySelectorAll('.requiredFields');
  const submitBtn = document.getElementById('submitBtn');


  passwordInput.addEventListener('blur', () => {
    const passwordValue = passwordInput.value.trim();
    const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,23}$/.test(passwordValue);

    if(!isValid) {
      passwordInput.classList.remove('focus:ring-blue-400');
      passwordInput.classList.add('ring-2', 'ring-red-400');
      passwordError.classList.remove('text-gray-400');
      passwordError.classList.add('text-red-500');
    } 
  });

  passwordInput.addEventListener('click', () => {
    passwordInput.classList.remove('focus:ring-red-400', 'ring-2');
    passwordInput.classList.add('focus:ring-blue-400');
    passwordError.classList.remove('text-red-500');
    passwordError.classList.add('text-gray-400');
  });


  function validatePasswordMatch() {
    const passwordValue = passwordInput.value.trim();
    const confirmPasswordValue = confirmPasswordInput.value.trim();

    if (confirmPasswordValue === '') {
      confirmPasswordError.classList.add('hidden');
    } else if (passwordValue === confirmPasswordValue) {
      confirmPasswordError.classList.remove('hidden');
      confirmPasswordIcon.classList.remove('fa-circle-exclamation', 'text-red-500');
      confirmPasswordIcon.classList.add('fa-circle-check', 'text-green-500');
      confirmPasswordMessage.classList.remove('text-red-500');
      confirmPasswordMessage.classList.add('text-green-500');
      confirmPasswordMessage.textContent = 'Passwords matches';
    } else {
      confirmPasswordError.classList.remove('hidden');
      confirmPasswordIcon.classList.remove('fa-circle-check', 'text-green-500');
      confirmPasswordIcon.classList.add('fa-circle-exclamation', 'text-red-500');
      confirmPasswordMessage.classList.remove('text-green-500');
      confirmPasswordMessage.classList.add('text-red-500');
      confirmPasswordMessage.textContent = 'Passwords do not match';
    }
  }

  
  passwordInput.addEventListener('input', () => {
    validatePasswordMatch();
    validateForm(); 
  });

  confirmPasswordInput.addEventListener('input', () => {
    validatePasswordMatch();
    validateForm();
  });


  function isPasswordValid(password) {
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,23}$/;
    return pattern.test(password);
  }

  function checkAllFieldsFilled() {
    let allFilled = true;

    requiredInputs.forEach(input => {
      if (input.value.trim() === '' || !input.checkValidity()) {
        allFilled = false;
      }
    });

    
    if (!isPasswordValid(passwordInput.value)) {
      allFilled = false;
    }

    
    if (passwordInput.value !== confirmPasswordInput.value) {
      allFilled = false;
    }

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
  confirmPasswordInput.addEventListener('input', checkAllFieldsFilled);