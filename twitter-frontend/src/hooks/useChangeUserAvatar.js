import {useState} from "react";
import useShowToast from "./useShowToast.js";

export const useChangeUserAvatar = () => {
    const [urlAvatar, setUrlImage] = useState(null);

    const showToast = useShowToast();

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        console.log(file)
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.onloadend = () => {
                setUrlImage(reader.result);
            };

            reader.readAsDataURL(file);

        } else {
            showToast(
                "Неверный формат файла",
                "Пожалуйста выберите изображение",
                "Ошибка"
            );

            setUrlImage(null);
        }
    };

    return {handleImageChange, urlAvatar, setUrlImage};
};
