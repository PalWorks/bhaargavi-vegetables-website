/**
 * Renders a JSON-LD structured-data block. Placed in the component body (Google
 * reads JSON-LD anywhere in the document) and captured by the build-time prerender.
 */
const JsonLd: React.FC<{ data: unknown }> = ({ data }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
);

export default JsonLd;
