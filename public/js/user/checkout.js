document.addEventListener('DOMContentLoaded', () => {

    const parseApiResponse = async (response) => {
      const contentType = response.headers.get("content-type") || "";
      const raw = await response.text();

      if (contentType.includes("application/json")) {
        try {
          return { data: JSON.parse(raw), raw };
        } catch (err) {
          return {
            data: { success: false, message: "Invalid JSON response from server." },
            raw
          };
        }
      }

      if (response.redirected && response.url.includes("/login")) {
        return {
          data: { success: false, message: "Your session expired. Please login and try again." },
          raw
        };
      }

      if (raw.trim().startsWith("<!DOCTYPE") || raw.trim().startsWith("<html")) {
        return {
          data: { success: false, message: "Server returned an HTML page instead of JSON." },
          raw
        };
      }

      return {
        data: { success: false, message: "Unexpected response from server." },
        raw
      };
    };
    const warningModal = document.getElementById("checkoutWarningModal");
    const warningText = document.getElementById("checkoutWarningText");
    const closeWarningBtn = document.getElementById("closeCheckoutWarning");

    const showCheckoutWarning = (message) => {
      if (!warningModal || !warningText) {
        alert(message);
        return;
      }
      warningText.textContent = message;
      warningModal.classList.remove("hidden");
      warningModal.classList.add("flex");
    };

    const hideCheckoutWarning = () => {
      if (!warningModal) return;
      warningModal.classList.add("hidden");
      warningModal.classList.remove("flex");
    };

    closeWarningBtn?.addEventListener("click", hideCheckoutWarning);
    warningModal?.addEventListener("click", (e) => {
      if (e.target === warningModal) hideCheckoutWarning();
    });
    const modal = document.getElementById('addressModal');
    const openBtn = document.getElementById('openModal');           // may be null
    const closeBtn = document.getElementById('closeModal');
    const form = document.getElementById('addressForm');
    const title = document.getElementById('modalTitle');
    const submitButton = document.getElementById('submitButton');
  
    // ——— Helpers ———
    const fields = form ? {
      name: form.querySelector('input[name="name"]'),
      phone: form.querySelector('input[name="phone"]'),
      pincode: form.querySelector('input[name="pincode"]'),
      flat: form.querySelector('input[name="flat"]'),
      area: form.querySelector('input[name="area"]'),
      landmark: form.querySelector('input[name="landmark"]'),
      town: form.querySelector('input[name="town"]'),
      state: form.querySelector('input[name="state"]'),
    } : null;
  
    const phoneError = document.createElement('p');
    phoneError.className = 'text-red-500 text-sm mt-1 hidden';
    const pinError = document.createElement('p');
    pinError.className = 'text-red-500 text-sm mt-1 hidden';

    if (fields?.phone) fields.phone.insertAdjacentElement('afterend', phoneError);
    if (fields?.pincode) fields.pincode.insertAdjacentElement('afterend', pinError);
  
    function resetValidation() {
      phoneError.classList.add('hidden');
      pinError.classList.add('hidden');
      fields.phone.classList.remove('focus:ring-red-400');
      fields.pincode.classList.remove('focus:ring-red-400');
      fields.phone.classList.add('focus:ring-teal-500');
      fields.pincode.classList.add('focus:ring-teal-500');
    }
  
    function validateForm() {
      if (!fields) return false;

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

          if (!form || !title || !submitButton || !modal) return;
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
  
      if (!form || !title || !submitButton || !modal || !fields) return;
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
      }
    } else if (urlParams.get('success') === '3') {
      const editSuccess = document.getElementById('editSuccess');
      if (editSuccess) {
        editSuccess.classList.remove('hidden');
        setTimeout(() => {
          editSuccess.classList.add('hidden');
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 2000);
      }
    }
  
    // ——— Live validation ———
    if (fields) {
      Object.values(fields).forEach((input) => input?.addEventListener('input', validateForm));
      validateForm();
    }



    // Change Address Modal
    const changeModal = document.getElementById('changeAddressModal');
    const closeChangeModal = document.getElementById('closeChangeModal');

    document.querySelectorAll('#changeAddressBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        changeModal?.classList.remove('hidden');
    });
    });

    closeChangeModal?.addEventListener('click', () => {
      changeModal?.classList.add('hidden');
    });

    // Close modal when clicking outside
    changeModal?.addEventListener('click', (e) => {
      if (e.target === changeModal) {
        changeModal.classList.add('hidden');
      }
    });

    const checkoutForm = document.getElementById("checkoutForm");
    if (!checkoutForm) return;
    const couponSelect = document.getElementById("couponSelect");
    const payableTotal = document.getElementById("payableTotal");
    const couponDiscountRow = document.getElementById("couponDiscountRow");
    const couponDiscountValue = document.getElementById("couponDiscountValue");
    const useWalletCheckbox = document.getElementById("useWallet");
    const walletUsedRow = document.getElementById("walletUsedRow");
    const walletUsedValue = document.getElementById("walletUsedValue");
    const remainingPayableRow = document.getElementById("remainingPayableRow");
    const remainingPayableValue = document.getElementById("remainingPayableValue");

    const baseTotal = Number(payableTotal?.dataset.baseTotal || 0);
    const walletBalance = Number(payableTotal?.dataset.walletBalance || 0);
    const formatINR = (value) => `₹${Math.round(value).toLocaleString("en-IN")}.00`;

    const computeSummary = () => {
      let couponDiscount = 0;
      if (couponSelect && couponSelect.value) {
        const selected = couponSelect.options[couponSelect.selectedIndex];
        const discountType = selected.dataset.discountType;
        const discountValue = Number(selected.dataset.discountValue || 0);
        const maxDiscount = selected.dataset.maxDiscount ? Number(selected.dataset.maxDiscount) : null;

        if (discountType === "FLAT") {
          couponDiscount = discountValue;
        } else {
          couponDiscount = (baseTotal * discountValue) / 100;
          if (maxDiscount && maxDiscount > 0) {
            couponDiscount = Math.min(couponDiscount, maxDiscount);
          }
        }
      }
      couponDiscount = Math.min(baseTotal, Math.round(couponDiscount));
      const payableAfterCoupon = Math.max(0, baseTotal - couponDiscount);
      const walletUsed = useWalletCheckbox?.checked ? Math.min(walletBalance, payableAfterCoupon) : 0;
      const remaining = Math.max(0, payableAfterCoupon - walletUsed);

      if (couponDiscountRow && couponDiscountValue) {
        if (couponDiscount > 0) {
          couponDiscountRow.classList.remove("hidden");
          couponDiscountValue.textContent = `- ₹${couponDiscount.toLocaleString("en-IN")}`;
        } else {
          couponDiscountRow.classList.add("hidden");
          couponDiscountValue.textContent = "- ₹0";
        }
      }

      if (walletUsedRow && walletUsedValue) {
        if (walletUsed > 0) {
          walletUsedRow.classList.remove("hidden");
          walletUsedValue.textContent = `- ₹${walletUsed.toLocaleString("en-IN")}`;
        } else {
          walletUsedRow.classList.add("hidden");
          walletUsedValue.textContent = "- ₹0";
        }
      }

      if (remainingPayableRow && remainingPayableValue) {
        if (useWalletCheckbox?.checked) {
          remainingPayableRow.classList.remove("hidden");
          remainingPayableValue.textContent = `₹${remaining.toLocaleString("en-IN")}`;
        } else {
          remainingPayableRow.classList.add("hidden");
          remainingPayableValue.textContent = "₹0";
        }
      }

      if (payableTotal) {
        payableTotal.textContent = formatINR(payableAfterCoupon);
      }

      return { couponDiscount, payableAfterCoupon, walletUsed, remaining };
    };

    couponSelect?.addEventListener("change", computeSummary);
    useWalletCheckbox?.addEventListener("change", computeSummary);
    computeSummary();

    checkoutForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(checkoutForm);
      const paymentMethod = formData.get("payment");
      const addressId = formData.get("addressId");
      const couponId = formData.get("couponId");
      const useWallet = formData.get("useWallet") === "on";

      if (!addressId) {
        showCheckoutWarning("Please select or add a delivery address.");
        return;
      }

      if(paymentMethod === "Cash on delivery") {
        checkoutForm.submit();
      } else if (paymentMethod === "online") {
        try {
          const response = await fetch('/order', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              addressId,
              payment: paymentMethod,
              couponId,
              useWallet
            })
          });
          const { data } = await parseApiResponse(response);

          if(!response.ok || !data.success) {
            alert(data.message || "Error creating Razorpay order");
            return;
          }

          if (data.walletOnly && data.orderId) {
            window.location.href = `/order/order-success/${data.orderId}`;
            return;
          }

          const options = {
            key: data.key,
            amount: data.amount,
            currency: data.currency,
            name: "Camverse",
            description: "Order Payment",
            order_id: data.razorpayOrderId,
            prefill: {
              name: data.customer?.name || "",
              email: data.customer?.email || "",
              contact: data.customer?.contact || ""
            },
            handler: async function(responseData) {
              const verifyRes = await fetch("/order/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: responseData.razorpay_order_id,
                  razorpay_payment_id: responseData.razorpay_payment_id,
                  razorpay_signature: responseData.razorpay_signature
                })
              });

              const { data: result } = await parseApiResponse(verifyRes);

              if(verifyRes.ok && result.success) {
                window.location.href = `/order/order-success/${result.orderId}`;
              } else {
                alert("Payment verification failed: " + (result.message || "Unknown error"));
              }
            },
            theme: { color: "#14b8a6"},
          };

          if (typeof window.Razorpay !== "function") {
            alert("Razorpay SDK failed to load. Please refresh and try again.");
            return;
          }

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (error) {
          console.error("Online payment flow failed:", error);
          alert("Could not start online payment. Please try again.");
        }
      } else if (paymentMethod === "wallet") {
        alert("Wallet checkout is not available right now.");
      } else {
        checkoutForm.submit();
      }
    });

});
  





  
