export default function Alert({ children, type = 'error' }) {
  if (!children) return null
  return <div role="alert" className={`alert ${type === 'success' ? 'alert-success' : 'alert-error'}`}>{children}</div>
}
