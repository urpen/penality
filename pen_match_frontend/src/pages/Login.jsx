import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendCode, verifyLogin, postAnswer, getPenType } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'code'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugCode, setDebugCode] = useState(''); // For demo purposes

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simple frontend email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setError('请输入有效的邮箱地址');
        setLoading(false);
        return;
      }

      const res = await sendCode(email);
      if (res.success) {
        setStep('code');
        setDebugCode(res.debugCode); // Show code for testing
      } else {
        setError(res.message || '发送验证码失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await verifyLogin(email, code); // Pass email instead of phone
      if (res.success) {
        // 保存用户信息
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('username', res.username);

        // 检查是否有待提交的答案
        const pendingAnswers = localStorage.getItem('pendingAnswers');

        if (pendingAnswers) {
          try {
            const answers = JSON.parse(pendingAnswers);
            // 批量提交所有答案
            await import('../api').then(module => module.submitBatchAnswers(res.userId, answers));
            localStorage.removeItem('pendingAnswers');

            // 提交完答案后，一定要重新获取结果
            const resultRes = await getPenType(res.userId);
            if (resultRes.success && resultRes.penType) {
              const typeName = resultRes.penType.name || resultRes.penType; // Handle string or object
              localStorage.setItem('penType', typeName);
              navigate(`/result/${res.userId}`);
              return;
            }
          } catch (err) {
            console.error('Error submitting pending answers:', err);
            // 如果提交失败，可能因为网络原因，还是要去结果页或者尝试重试，这里暂且去结果页看看有没有缓存
            navigate(`/result/${res.userId}`);
            return;
          }
        }

        // 如果没有待提交答案，检查该用户是否已经有过结果
        try {
          // 即使 res.penType 为空，也主动去查询一次以防万一
          if (!res.penType) {
            const checkRes = await getPenType(res.userId);
            if (checkRes.success && checkRes.penType) {
              const typeName = checkRes.penType.name || checkRes.penType;
              localStorage.setItem('penType', typeName);
              navigate(`/result/${res.userId}`);
              return;
            }
          } else {
            // 登录接口直接返回了 penType
            localStorage.setItem('penType', res.penType);
            navigate(`/result/${res.userId}`);
            return;
          }
        } catch (e) {
          console.warn("Failed to check pen type", e);
        }

        // 只有确信没有结果时，才去答题页
        navigate('/questions');
      } else {
        setError(res.message || '登录失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="auth-card">
        <h2 className="auth-title">邮箱登录/注册</h2>
        {error && <div className="error-message">{error}</div>}

        {/* Debug Info for Demo */}
        {debugCode && (
          <div style={{ background: '#e6f7ff', padding: '10px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', color: '#1890ff' }}>
            测试验证码: <strong>{debugCode}</strong>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendCode}>
            <div className="form-group">
              <label>邮箱地址</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱 (e.g., name@example.com)"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '发送中...' : '获取验证码'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>邮箱: {email}</label>
              <div style={{ marginTop: '0.5rem' }}>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入6位验证码"
                  required
                  maxLength={6}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '登录中...' : '登录 / 注册'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setStep('email'); setDebugCode(''); setError(''); }}
              style={{ marginTop: '1rem' }}
            >
              返回修改邮箱
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
