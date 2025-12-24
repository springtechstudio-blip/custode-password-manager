
import React, { useState } from 'react';
import { Shield, ArrowRight, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuthContext } from '../contexts';
import { validateMasterPassword } from '../lib/crypto';

interface Props {
  onComplete: () => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const { register, login, isLoading } = useAuthContext();

  const [mode, setMode] = useState<'welcome' | 'register' | 'login'>('welcome');
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    // Validate
    const validation = validateMasterPassword(masterPassword);
    if (!validation.isValid) {
      setError(validation.failedRequirements.join(', '));
      return;
    }

    if (masterPassword !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    // Register
    const result = await register(email, masterPassword, confirmPassword);
    if (result.success) {
      onComplete();
    } else {
      setError(result.error || 'Errore durante la registrazione');
    }
  };

  const handleLogin = async () => {
    setError('');

    // Login
    const result = await login(email, masterPassword);
    if (result.success) {
      onComplete();
    } else {
      setError(result.error || 'Errore durante il login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col w-full overflow-x-hidden">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6 py-8 md:px-8 animate-in fade-in duration-1000">
        {/* Welcome Screen */}
        {mode === 'welcome' && (
          <div className="text-center space-y-8 animate-in zoom-in-95 duration-700 w-full">
            <div className="w-24 h-24 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-50">
              <Shield size={48} className="text-orange-500" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Custode</h1>
              <p className="text-gray-400 mt-4 text-lg leading-relaxed px-4">
                Password, note e API key. <br/>Tutto in un posto sicuro.
              </p>
            </div>

            <div className="space-y-4 mt-12">
              <button
                onClick={() => setMode('register')}
                className="w-full py-5 bg-[#1E3A8A] text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <UserPlus size={20} />
                Crea Nuovo Account
              </button>

              <button
                onClick={() => setMode('login')}
                className="w-full py-5 bg-gray-100 text-gray-700 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-200 active:scale-95 transition-all"
              >
                <LogIn size={20} />
                Accedi
              </button>
            </div>
          </div>
        )}

        {/* Registration Form */}
        {mode === 'register' && (
          <div className="w-full animate-in slide-in-from-right-10 duration-500">
            <button
              onClick={() => setMode('welcome')}
              className="text-gray-400 hover:text-gray-600 mb-6"
            >
              ← Indietro
            </button>

            <h2 className="text-4xl font-extrabold text-[#0F172A] mb-2">Registrazione</h2>
            <p className="text-[#64748B] text-lg leading-relaxed mb-8">
              Crea il tuo vault sicuro con una master password forte.
            </p>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-[1.5rem] p-4 mb-6">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-600 mb-2 block">Email</label>
              <input
                type="email"
                placeholder="tua@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8FAFC] border-2 border-gray-200 rounded-[1.5rem] px-6 py-4 text-lg font-medium text-gray-900 focus:border-orange-300 outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Master Password */}
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-600 mb-2 block">Master Password</label>
              <div className="bg-[#F8FAFC] border-2 border-[#FFE4D6] rounded-[1.5rem] p-1 flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimo 12 caratteri"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="w-full bg-transparent border-none px-5 py-4 text-lg font-medium text-gray-900 focus:ring-0 outline-none placeholder:text-gray-300"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-4 text-gray-300 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="text-sm font-bold text-gray-600 mb-2 block">Conferma Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Ripeti la password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#F8FAFC] border-2 border-gray-200 rounded-[1.5rem] px-6 py-4 text-lg font-medium text-gray-900 focus:border-orange-300 outline-none placeholder:text-gray-300"
              />
            </div>

            {/* Requirements */}
            <div className="space-y-3 mb-8">
              <Requirement met={masterPassword.length >= 12} label="Almeno 12 caratteri" />
              <Requirement met={/[A-Z]/.test(masterPassword)} label="Una maiuscola" />
              <Requirement met={/[a-z]/.test(masterPassword)} label="Una minuscola" />
              <Requirement met={/[0-9]/.test(masterPassword)} label="Un numero" />
              <Requirement met={/[!@#$%^&*]/.test(masterPassword)} label="Un carattere speciale" />
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-[1.5rem] p-4 mb-6">
              <p className="text-orange-700 text-sm font-medium">
                ⚠️ <strong>Importante:</strong> Custode non può recuperare la tua master password. Annotala in un posto sicuro!
              </p>
            </div>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <div className="w-full animate-in slide-in-from-right-10 duration-500">
            <button
              onClick={() => setMode('welcome')}
              className="text-gray-400 hover:text-gray-600 mb-6"
            >
              ← Indietro
            </button>

            <h2 className="text-4xl font-extrabold text-[#0F172A] mb-2">Accedi</h2>
            <p className="text-[#64748B] text-lg leading-relaxed mb-8">
              Sblocca il tuo vault con la master password.
            </p>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-[1.5rem] p-4 mb-6">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-600 mb-2 block">Email</label>
              <input
                type="email"
                placeholder="tua@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8FAFC] border-2 border-gray-200 rounded-[1.5rem] px-6 py-4 text-lg font-medium text-gray-900 focus:border-orange-300 outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Master Password */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-600 mb-2 block">Master Password</label>
              <div className="bg-[#F8FAFC] border-2 border-gray-200 rounded-[1.5rem] p-1 flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="La tua master password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-transparent border-none px-5 py-4 text-lg font-medium text-gray-900 focus:ring-0 outline-none placeholder:text-gray-300"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-4 text-gray-300 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto w-full px-6 pb-8 md:px-8">
        {/* Action Button */}
        {mode !== 'welcome' && (
          <button
            onClick={mode === 'register' ? handleRegister : handleLogin}
            disabled={isLoading || !email || !masterPassword || (mode === 'register' && !confirmPassword)}
            className="w-full py-5 bg-[#1E3A8A] text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
          >
            {isLoading ? 'Caricamento...' : (mode === 'register' ? 'Crea Vault' : 'Sblocca Vault')}
            <ArrowRight size={20} />
          </button>
        )}

        <p className="text-center text-gray-300 text-xs mt-8 font-medium tracking-widest uppercase">
          Secured with AES-256-GCM
        </p>
      </div>
    </div>
  );
};

const Requirement: React.FC<{ met: boolean, label: string }> = ({ met, label }) => (
  <div className="flex items-center gap-3">
    <div className={`w-2 h-2 rounded-full transition-colors ${met ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-200'}`}></div>
    <span className={`text-base font-medium transition-colors ${met ? 'text-gray-900' : 'text-gray-300'}`}>{label}</span>
  </div>
);

export default Onboarding;
