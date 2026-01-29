import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card max-w-xl w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
        {description && <p className="text-gray-600 mb-6">{description}</p>}
        <button
          type="button"
          className="btn-primary px-6"
          onClick={() => navigate('/dashboard')}
        >
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}
