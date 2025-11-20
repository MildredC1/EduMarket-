export function Card({ children }) {
  return <div style={{ border: '1px solid #ccc', padding: '20px' }}>{children}</div>;
}

export function CardHeader({ children }) {
  return <header style={{ marginBottom: '10px' }}>{children}</header>;
}

export function CardBody({ children }) {
  return <main style={{ margin: '20px 0' }}>{children}</main>;
}

export function CardFooter({ children }) {
  return <footer style={{ marginTop: '10px', fontSize: '0.9em', color: '#555' }}>{children}</footer>;
}
