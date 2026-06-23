import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-mist flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white border border-boundary rounded-2xl shadow-card p-8 text-center">
        <Link to="/" className="font-serif text-2xl text-ink inline-block mb-6">ResumOrph</Link>
        <div className="w-16 h-16 bg-cobalt-subtle text-cobalt rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-4.8a2 2 0 012.22 0l8 4.8A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-ink font-bold mb-2">Check Your Inbox</h2>
        <p className="text-sm text-graphite mb-6 leading-relaxed">
          We've sent a verification link to your email address. Please click the link to confirm your account and log in.
        </p>
        <Link to="/login" className="block w-full">
          <Button variant="primary" className="w-full">Proceed to Login</Button>
        </Link>
      </div>
    </div>
  );
}
