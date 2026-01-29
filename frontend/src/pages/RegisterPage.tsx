import { useState } from 'react';
import { Link } from 'react-router-dom';
import RegisterHospitalForm from '../components/RegisterHospitalForm';
import RegisterDoctorForm from '../components/RegisterDoctorForm';
import RegisterEmployeeForm from '../components/RegisterEmployeeForm';
import type { UserType } from '../types';

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType>('hospital');

  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card glass-effect">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              회원가입
            </h1>
            <p className="text-gray-700 font-medium"><strong className="text-indigo-600">THERANOVA</strong> 계약서 관리 시스템에 가입하세요</p>
          </div>

          {/* 사용자 유형 선택 */}
          <div className="mb-8">
            <label className="label text-center text-gray-700">가입 유형 선택</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className={`py-4 px-4 rounded-xl border-2 transition-all duration-300 ${
                  userType === 'hospital'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:shadow-md'
                }`}
                onClick={() => setUserType('hospital')}
              >
                <div className="text-2xl mb-1">🏥</div>
                <div className="font-semibold">병원</div>
                <div className="text-xs mt-1 opacity-90">의료기관</div>
              </button>
              <button
                type="button"
                className={`py-4 px-4 rounded-xl border-2 transition-all duration-300 ${
                  userType === 'doctor'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:shadow-md'
                }`}
                onClick={() => setUserType('doctor')}
              >
                <div className="text-2xl mb-1">👨‍⚕️</div>
                <div className="font-semibold">의사</div>
                <div className="text-xs mt-1 opacity-90">의료인</div>
              </button>
              <button
                type="button"
                className={`py-4 px-4 rounded-xl border-2 transition-all duration-300 ${
                  userType === 'employee'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:shadow-md'
                }`}
                onClick={() => setUserType('employee')}
              >
                <div className="text-2xl mb-1">👤</div>
                <div className="font-semibold">일반직원</div>
                <div className="text-xs mt-1 opacity-90">근로자</div>
              </button>
            </div>
          </div>

          {/* 회원가입 폼 */}
          <div>
            {userType === 'hospital' && <RegisterHospitalForm />}
            {userType === 'doctor' && <RegisterDoctorForm />}
            {userType === 'employee' && <RegisterEmployeeForm />}
          </div>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
