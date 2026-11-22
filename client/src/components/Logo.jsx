export default function Logo({ size = 'md' }) {
  return (
    <span className={`logo logo-${size}`}>
      <span className="logo-mark" aria-hidden="true">∞</span>
      <span className="logo-text">Infinity Classes</span>
    </span>
  );
}
