import { useNavigate } from 'react-router-dom';

export default function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-700 mb-3">준비중입니다</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          일반 근로계약서 기능은 현재 준비중입니다.<br />
          빠른 시일 내에 제공될 예정입니다.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary w-full"
        >
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}
