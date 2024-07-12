export const Capitalize = (str: string, eachWord = false) => {
    if (eachWord === false) {
        return `${str[0].toUpperCase()}${str.slice(1)}`;
    }

    let newStr = "";
    for (const word of str.split(" ")) {
        newStr += `${word[0].toUpperCase()}${word.length > 1 ? word.slice(1) : ""} `
    }

    return newStr;
}