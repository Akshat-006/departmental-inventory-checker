import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const initialForm = { name: '', email: '', department: '', password: '', confirmPassword: '' };

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        department: form.department,
        password: form.password,
      });
      navigate('/dashboard');
    } catch (signupError) {
      setError(signupError.response?.data?.message || 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="card w-full max-w-lg p-8">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-500">Departmental Inventory</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Faculty account</h1>
          <p className="mt-2 text-sm text-slate-500">Create an account to browse inventory and request equipment.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="signup-name">Full name</label>
            <input id="signup-name" className="input" name="name" autoComplete="name" value={form.name} onChange={handleChange} required maxLength={100} />
          </div>
          <div>
            <label className="label" htmlFor="signup-email">Institutional email</label>
            <input id="signup-email" className="input" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required maxLength={254} />
          </div>
          <div>
            <label className="label" htmlFor="signup-department">Department</label>
            <input id="signup-department" className="input" name="department" value={form.department} onChange={handleChange} required maxLength={100} />
          </div>
          <div>
            <label className="label" htmlFor="signup-password">Password</label>
            <input id="signup-password" className="input" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} required minLength={8} />
          </div>
          <div>
            <label className="label" htmlFor="signup-confirm-password">Confirm password</label>
            <input id="signup-confirm-password" className="input" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} required minLength={8} />
          </div>

          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Creating account...' : 'Create faculty account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered? <Link to="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link>
        </p>
        <p className="mt-3 text-center text-xs text-slate-500">Public registration creates faculty access only. Staff accounts are managed by an administrator.</p>
      </div>
    </div>
  );
}
