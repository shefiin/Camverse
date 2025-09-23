const { handler } = require("@tailwindcss/line-clamp");
const Razorpay = require("razorpay");

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('addressModal');
    const openBtn = document.getElementById('openModal');           // may be null
    const closeBtn = document.getElementById('closeModal');
    const form = document.getElementById('addressForm');
    const title = document.getElementById('modalTitle');
    const submitButton = document.getElementById('submitButton');
  
    // ——— Helpers ———
    const fields = {
      name: form.querySelector('input[name="name"]'),
      phone: form.querySelector('input[name="phone"]'),
      pincode: form.querySelector('input[name="pincode"]'),
      flat: form.querySelector('input[name="flat"]'),
      area: form.querySelector('input[name="area"]'),
      landmark: form.querySelector('input[name="landmark"]'),
      town: form.querySelector('input[name="town"]'),
      state: form.querySelector('input[name="state"]'),
    };
  
    const phoneError = document.createElement('p');
    phoneError.className = 'text-red-500 text-sm mt-1 hidden';
    fields.phone.insertAdjacentElement('afterend', phoneError);
  
    const pinError = document.createElement('p');
    pinError.className = 'text-red-500 text-sm mt-1 hidden';
    fields.pincode.insertAdjacentElement('afterend', pinError);
  
    function resetValidation() {
      phoneError.classList.add('hidden');
      pinError.classList.add('hidden');
      fields.phone.classList.remove('focus:ring-red-400');
      fields.pincode.classList.remove('focus:ring-red-400');
      fields.phone.classList.add('focus:ring-teal-500');
      fields.pincode.classList.add('focus:ring-teal-500');
    }
  
    function validateForm() {
      let valid =
        fields.name.value.trim() &&
        fields.phone.value.trim() &&
        fields.pincode.value.trim() &&
        fields.flat.value.trim() &&
        fields.town.value.trim() &&
        fields.state.value.trim();
  
      // phone
      if (fields.phone.value && !/^\d+$/.test(fields.phone.value)) {
        phoneError.textContent = 'Phone must be numbers.';
        phoneError.classList.remove('hidden');
        fields.phone.classList.add('focus:ring-red-400');
        valid = false;
      } else if (fields.phone.value.length > 10) {
        phoneError.textContent = 'Maximum 10 digits.';
        phoneError.classList.remove('hidden');
        fields.phone.classList.add('focus:ring-red-400');
        valid = false;
      } else {
        phoneError.classList.add('hidden');
        fields.phone.classList.remove('focus:ring-red-400');
      }
  
      // pincode
      if (fields.pincode.value && !/^\d+$/.test(fields.pincode.value)) {
        pinError.textContent = 'Pincode must be numbers.';
        pinError.classList.remove('hidden');
        fields.pincode.classList.add('focus:ring-red-400');
        valid = false;
      } else if (fields.pincode.value.length > 6) {
        pinError.textContent = 'Maximum 6 digits.';
        pinError.classList.remove('hidden');
        fields.pincode.classList.add('focus:ring-red-400');
        valid = false;
      } else {
        pinError.classList.add('hidden');
        fields.pincode.classList.remove('focus:ring-red-400');
      }
  
      submitButton.disabled = !valid;
      submitButton.classList.toggle('opacity-50', !valid);
      submitButton.classList.toggle('cursor-not-allowed', !valid);
    }
  
    // ——— Add flow (guarded) ———
    document.querySelectorAll('.openAddressModal').forEach(btn => {
        btn.addEventListener('click', () => {

          const changeModal = document.getElementById('changeAddressModal');
          if (changeModal) {
              changeModal.classList.add('hidden');
          }  

          form.action = '/user/address/add';
          title.textContent = 'Add address';
          submitButton.textContent = 'Add address';
          form.reset();
          resetValidation();
          validateForm();
          modal.classList.remove('hidden'); 
        });
    });
      
  
    // ——— Edit flow (event delegation so it always works) ———
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.editAddressBtn');
      if (!btn) return;
  
      form.action = `/user/address/edit/${btn.dataset.id}?_method=PATCH`;
      title.textContent = 'Edit Address';
      submitButton.textContent = 'Save changes';
  
      fields.name.value = btn.dataset.name || '';
      fields.phone.value = btn.dataset.phone || '';
      fields.pincode.value = btn.dataset.pincode || '';
      fields.flat.value = btn.dataset.flat || '';
      fields.area.value = btn.dataset.area || '';
      fields.landmark.value = btn.dataset.landmark || '';
      fields.town.value = btn.dataset.town || '';
      fields.state.value = btn.dataset.state || '';
  
      resetValidation();
      validateForm();
      modal.classList.remove('hidden');
    });
  
    // ——— Close/hide ———
    closeBtn?.addEventListener('click', () => modal.classList.add('hidden'));
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  
    // ——— Success toast clearing ———
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === '1') {
      const message = document.getElementById('successMessage');
      if (message) {
        message.classList.remove('hidden');
        setTimeout(() => {
          message.classList.add('hidden');
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 2000);
      } else if (success === '3') {
        const editSuccess = document.getElementById('editSuccess');
        editSuccess.classList.remove('hidden');

        setTimeout(() => {
        editSuccess.classList.add('hidden');
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        }, 2000); 
    } 
    }
  
    // ——— Live validation ———
    Object.values(fields).forEach((input) => input.addEventListener('input', validateForm));
    validateForm();



    // Change Address Modal
    const changeModal = document.getElementById('changeAddressModal');
    const closeChangeModal = document.getElementById('closeChangeModal');

    document.querySelectorAll('#changeAddressBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        changeModal.classList.remove('hidden');
    });
    });

    closeChangeModal.addEventListener('click', () => {
    changeModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    changeModal.addEventListener('click', (e) => {
    if (e.target === changeModal) {
        changeModal.classList.add('hidden');
    }
    });

    const checkoutForm = document.getElementById("checkoutForm");

    checkoutForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(checkoutForm);
      const paymentMethod = formData.get("payment");

      if(paymentMethod === "Cash on delivery") {
        checkoutForm.submit();
      } else if (paymentMethod === "online") {
        const response = await fetch('/order', {
          method: "POST",
          body: formData
        });
        const data = await response.json();

        if(!data.success) {
          alert("Error creating Razorpay order");
          return;
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: "Camverse",
          description: "Order Payment",
          order_id: data.razorpayOrderId,
          handler: async function(response) {
            const verifyRes = await fetch("/order/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })                      
            });

            const result = await verifyRes.json();

            if(result.success) {
              window.location.href = `/order/order-sucess/${result.orderId}`;
            } else {
              alert("Payment verification failed: " + result.message);
            }
          },
          theme: { color: "#14b8a6"},
        };

        const rzp = new Razorpay(options);
        rzp.open();
      }
      
    });

});
  





  




