import { toast } from 'react-toastify';

const toastify = {
    notifySuccess: (msg: string) => toast.success(msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      })
} 

export default toastify