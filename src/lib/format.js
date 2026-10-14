export function capitalizeWords(text) {
  return text.replace(/(^|\s)(\p{L})/gu, (match, space, letter) => space + letter.toUpperCase());
}

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
