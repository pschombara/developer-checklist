import Swal from "sweetalert2";

export const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export const ConfirmationPrompt = Swal.mixin({
    icon: 'warning',
    title: 'Are you sure?',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
});

export const SuccessPrompt = Swal.mixin({
    icon: 'success',
});

export const ErrorPrompt = Swal.mixin({
    icon: 'error'
});
