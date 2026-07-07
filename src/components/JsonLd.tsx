/**
 * Renders a JSON-LD structured-data block. Placed in the component body (Google
 * reads JSON-LD anywhere in the document) and captured by the build-time prerender.
 *
 * JSON.stringify does not escape `<`, `>` or `&`, so a catalog value containing
 * `</script>` could otherwise break out of the tag. Escape them to their \u form
 * (valid JSON, safe inside a <script> block).
 */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

const JsonLd: React.FC<{ data: unknown }> = ({ data }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
);

export default JsonLd;
