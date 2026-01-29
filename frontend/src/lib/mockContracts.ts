export type ContractType = 'daily' | 'regular';

export interface MockContract {
  id: string;
  type: ContractType;
  title: string;
  participantName: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

const STORAGE_KEY = 'mockContracts';

export function loadMockContracts(): MockContract[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw || raw === 'undefined' || raw === 'null') {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveMockContracts(contracts: MockContract[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
}

export function addMockContract(contract: MockContract) {
  const current = loadMockContracts();
  current.unshift(contract);
  saveMockContracts(current);
}

export function clearMockContracts() {
  localStorage.removeItem(STORAGE_KEY);
}

export function createContractId() {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
