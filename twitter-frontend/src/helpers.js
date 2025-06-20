export const getShortedLink = (text) => {
    const re = /([^\"=]{2}|^)((https?|ftp):\/\/\S+[^\s.,> )\];'\"!?])/;
    const subst = '$1<a href="$2" target="_blank" class="user-post-link">Ссылка</a>';

    let result;

    for (let i = 0; i < text.length; i++) {
        if (text[i] === "/" && text[i + 1] === "/") {
            result = text.replace(re, subst);
        }
    }

    return result === undefined ? text : result
}