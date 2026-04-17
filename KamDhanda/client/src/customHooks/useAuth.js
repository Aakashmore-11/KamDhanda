import { useSelector } from "react-redux"

const useAuth = () => {
    const { user, role, isLoggedIn } = useSelector(state => state.auth);
    return { user, role, isLoggedIn }
}

export default useAuth;