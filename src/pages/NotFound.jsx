import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-mist flex flex-col items-center justify-center p-4 text-center animate-fade-in font-sans">
      <span className="font-mono text-cobalt text-sm font-semibold uppercase tracking-widest mb-2">404 Error</span>
      <h1 className="font-serif text-5xl text-ink font-bold mb-4">Page Not Found</h1>
      <p className="text-sm text-graphite mb-8 max-w-sm leading-relaxed">
        The page you are looking for doesn't exist or has been moved. Let's get you back to safety.
      </p>
      <Link to="/">
        <Button variant="primary">Go Home</Button>
      </Link>
    </div>
  );
}
