import { useParams } from 'react-router'

// Placeholder. Product loading and the 404 for unknown slugs arrive with REQ-WEB-PRODUCT-001.
export function ProductPage() {
  const { slug } = useParams()
  return (
    <>
      <h1>Producto</h1>
      <p>{slug}</p>
    </>
  )
}
