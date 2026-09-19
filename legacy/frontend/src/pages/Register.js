import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Validation state
  const [reqLength, setReqLength] = useState(false);
  const [reqLower, setReqLower] = useState(false);
  const [reqSpecial, setReqSpecial] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setReqLength(password.length >= 9);
    setReqLower(/[a-z]/.test(password));
    setReqSpecial(/[!@#$%^&*()_+={}[\]|\\:;"'<>,.?/-]/.test(password));
  }, [password]);

  const isValid = reqLength && reqLower && reqSpecial;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setErrorMsg('Please ensure your password meets all requirements.');
      return;
    }
    setErrorMsg('');
    try {
      // name is no longer required explicitly as per modern flow 
      // the backend has been updated to accept just email and password, picking default name
      await register("User", email, password); // Passed 'User' tentatively, backend defaults to email split
      navigate('/');
    } catch (err) {
      setErrorMsg(err?.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join EasyApply and organize your career</p>
        </div>
        
        {errorMsg && <div className="error-message">{errorMsg}</div>}
        
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <div className="password-requirements">
            <p>Password must contain:</p>
            <ul>
              <li className={reqLength ? 'req-met' : 'req-unmet'}>More than 8 characters</li>
              <li className={reqLower ? 'req-met' : 'req-unmet'}>At least one lowercase letter</li>
              <li className={reqSpecial ? 'req-met' : 'req-unmet'}>At least one special character</li>
            </ul>
          </div>

          <button type="submit" className="auth-button" disabled={!isValid || !email}>
            Sign Up
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;