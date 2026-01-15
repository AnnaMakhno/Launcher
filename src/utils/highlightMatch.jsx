import React from "react";

export default function highlightMatch(text, filter) {
    if (!filter || !text) return text;

    const regex = new RegExp(`(${filter})`, "ig");
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
}
