  document.querySelectorAll('.toggle-status-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const userId = button.getAttribute('data-id');
      const newStatus = button.getAttribute('data-status');

      const result = await Swal.fire({
        title: `${newStatus} this user?`,
        text: `Are you sure you want to ${newStatus.toLowerCase()} this user?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#ef4444',
        confirmButtonText: `Yes, ${newStatus}`
      });

      if (result.isConfirmed) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/users/${userId}/toggle-status`;

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'status';
        hiddenInput.value = newStatus;

        form.appendChild(hiddenInput);
        document.body.appendChild(form);
        form.submit();
      }
    });
  });

