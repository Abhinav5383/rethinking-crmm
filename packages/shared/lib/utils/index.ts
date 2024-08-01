export const Capitalize = (str: string, eachWord = false) => {
    if (eachWord === false) {
        return `${str[0].toUpperCase()}${str.slice(1)}`;
    }

    let newStr = "";
    for (const word of str.split(" ")) {
        newStr += `${word[0].toUpperCase()}${word.length > 1 ? word.slice(1) : ""} `;
    }

    return newStr;
};

export function CapitalizeAndFormatString(str: string | null | undefined) {
    if (!str) return str;

    return Capitalize(str).replaceAll("_", " ").replaceAll("-", " ");
}

export function createURLSafeSlug(slug: string) {
    const allowedURLCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`!@$()-_.,"';

    const result = {
        validInput: false,
        value: "",
    };

    for (const char of slug.replaceAll(" ", "-").toLowerCase()) {
        if (allowedURLCharacters.includes(char)) {
            result.value += char;
        }
    }

    return result;
}

export function formatUserName(str: string, additionalChars?: string) {
    const allowedCharacters = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKMNOPQRSTUVWXYZ1234567890-_${additionalChars || ""}`;

    let formattedString = "";
    for (const char of str) {
        if (allowedCharacters.includes(char)) formattedString += char;
    }

    return formattedString;
}
