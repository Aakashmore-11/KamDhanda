import toast from "react-hot-toast"

const handleSuccessMsg = (msg) => {
    toast.success(msg)
}

const handleErrorMsg = (msg) => {
    toast.error(msg)
}

export { handleErrorMsg, handleSuccessMsg }