export const fetcher = async (link) => {
  const response = await fetch(link);
  const html_text = await response.text()
  return html_text
};

fetcher("https://example.com");
