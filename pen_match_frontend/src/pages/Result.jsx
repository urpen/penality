import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPenType, getAIAnalysis, initiatePayment, verifyPayment } from '../api';

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI & Payment States
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [step, setStep] = useState('offer'); // offer -> payment -> paid (loading) -> result
  const [paymentInfo, setPaymentInfo] = useState(null); // { orderId, qrCode, paymentUrl }
  const [paymentMethod, setPaymentMethod] = useState(''); // 'wechat' | 'alipay'
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await getPenType(id);
        if (res.success) {
          setResult(res.penType);
        } else {
          alert('获取结果失败');
        }
      } catch (err) {
        console.error(err);
        alert('网络错误');
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id]);

  const handleUnlockClick = async () => {
    setShowAIModal(true);
    // Check if already exist
    try {
      const existing = await getAIAnalysis(id);
      if (existing.success && existing.report && existing.isPaid) {
        setAiReport(existing.report);
        setStep('result');
        return;
      }
    } catch (e) { console.log(e); }
    setStep('offer');
  };

  const handleInitiatePayment = async (method) => {
    setPaymentMethod(method);
    setVerifying(true);
    try {
      const res = await initiatePayment(id, method);
      if (res.success) {
        setPaymentInfo(res);
        setStep('payment');
      } else {
        alert(res.message || '支付初始化失败');
      }
    } catch (e) {
      alert('网络错误');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentInfo || !paymentInfo.orderId) return;
    setVerifying(true);
    try {
      const res = await verifyPayment(id, paymentInfo.orderId);
      if (res.success && res.status === 'PAID') {
        setAiReport(res.report);
        setStep('result');
      } else {
        alert(res.message || '支付尚未完成，请稍后再试');
      }
    } catch (e) {
      alert('网络错误');
    } finally {
      setVerifying(false);
    }
  };


  if (loading) return <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>分析性格中...</div>;
  if (!result) return <div className="page-container">暂无结果</div>;

  return (
    <div className="page-container">
      <nav className="nav">
        <div className="logo">测测笔格</div>
        <div className="links">
          <Link to="/">首页</Link>
          <span onClick={() => {
            localStorage.clear();
            navigate('/login');
          }} style={{ cursor: 'pointer', marginLeft: '1.5rem' }}>退出</span>
        </div>
      </nav>

      <div className="result-container">
        <div className="pen-type-card">
          <div className="pen-type-title">{result.name}</div>

          {result.slogan && (
            <div style={{
              fontSize: '1.2rem',
              fontStyle: 'italic',
              color: '#666',
              marginBottom: '2rem',
              textAlign: 'center',
              borderBottom: '1px solid #eee',
              paddingBottom: '1rem'
            }}>
              "{result.slogan}"
            </div>
          )}

          <div className="result-section">
            <h3>🖋️ 核心画像</h3>
            <div className="pen-type-desc">{result.description}</div>
          </div>

          {result.shadow_side && (
            <div className="result-section" style={{ marginTop: '2rem' }}>
              <h3 style={{ color: '#7f8c8d' }}>🌑 阴影面</h3>
              <p style={{ lineHeight: '1.6', color: '#555' }}>{result.shadow_side}</p>
            </div>
          )}

          {result.advice && (
            <div className="result-section" style={{ marginTop: '2rem', background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{ color: '#27ae60' }}>💡 大师建议</h3>
              <p style={{ lineHeight: '1.6', color: '#333', fontStyle: 'italic' }}>{result.advice}</p>
            </div>
          )}

          {/* AI Unlock Card */}
          <div style={{
            marginTop: '2rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 10px 20px rgba(118, 75, 162, 0.2)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>🤖 解锁您的专属深度性格分析</h2>
            <p style={{ fontSize: '1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
              一键生成1500字深度报告，包含：性格盲区、职业建议、情感模式解析。
            </p>
            <button
              onClick={handleUnlockClick}
              style={{
                background: '#ffd700',
                color: '#333',
                border: 'none',
                padding: '1rem 2.5rem',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              立刻解锁 (¥9.9) 💎
            </button>
          </div>

          <div className="action-buttons" style={{ marginTop: '3rem' }}>
            <Link to={"/match/" + result.name} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
              寻找笔友 ({result.name})
            </Link>
            <Link to="/questions" className="btn-secondary">
              重新测试
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showAIModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
        }} onClick={() => setShowAIModal(false)}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '2rem',
            width: '100%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAIModal(false)} style={{ position: 'absolute', top: '10px', right: '15px', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>

            {step === 'offer' && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#333', marginBottom: '1rem' }}>升级您的体验</h2>
                <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6', color: '#555' }}>
                  <p>✅ <b>1500字+</b> 深度性格解析</p>
                  <p>✅ <b>潜意识画像</b>：你未曾察觉的自己</p>
                  <p>✅ <b>专属建议</b>：职场、人际、情感全方位指导</p>
                  <p>✅ <b>永久保存</b>：随时回看</p>
                </div>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>仅需 ¥9.9 <span style={{ fontSize: '0.9rem', color: '#999', textDecoration: 'line-through' }}>原价 ¥29.9</span></p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button onClick={() => handleInitiatePayment('wechat')} disabled={verifying} style={{ background: '#07c160', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
                    微信支付
                  </button>
                  <button onClick={() => handleInitiatePayment('alipay')} disabled={verifying} style={{ background: '#1677ff', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
                    支付宝
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && paymentInfo && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1rem' }}>{paymentMethod === 'wechat' ? '微信' : '支付宝'}扫码支付</h3>
                <div style={{ width: '200px', height: '200px', background: '#eee', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* In real app, render QR code here. For mock, just text */}
                  <div style={{ padding: '10px' }}>
                    {paymentInfo.qrCode || "模拟二维码"}
                  </div>
                </div>
                <div style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  订单号: <br />{paymentInfo.orderId}
                </div>
                <button onClick={handleVerifyPayment} disabled={verifying} style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px',
                  fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%'
                }}>
                  {verifying ? '验证中...' : '我已完成支付'}
                </button>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#999' }}>
                  (模拟模式：点击按钮直接验证成功)
                </div>
              </div>
            )}

            {step === 'result' && (
              <div>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#667eea' }}>🔮 深度分析报告</h2>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#333', fontSize: '1rem' }}>
                  {aiReport}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
