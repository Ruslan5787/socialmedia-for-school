import {useCallback} from "react";
import {toaster} from "../components/ui/toaster.jsx";

const useShowToast = () => {
    return useCallback((title, description, type) => {
        toaster.create({
            title,
            description,
            type,
        });
    }, []);
};

export default useShowToast;
