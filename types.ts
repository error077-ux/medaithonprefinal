export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  ADMIN = 'ADMIN',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  RADIOLOGIST = 'RADIOLOGIST',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  abhaId?: string; // For patients
  aadhaar?: string; // For patients
  department?: string; // For staff
}

export interface Department {
  id: string;
  name: string;
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  specialty: string;
}

export interface TriageInfo {
  vitals: {
    bloodPressure: string;
    temperature: string;
    heartRate: string;
    respiratoryRate: string;
  };
  allergies: {
    food: string;
    medication: string;
  };
  currentMedications: string;
  triageNotes: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  departmentName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending Triage';
  notes?: string;
  triageData?: TriageInfo;
}

export enum TestType {
  LAB = 'LAB',
  RADIOLOGY = 'RADIOLOGY',
}

export interface TestRequest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  testName: string;
  type: TestType;
  status: 'Pending' | 'Completed';
  result?: string;
  resultDate?: string;
  requestDate: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medication: string;
  dosage: string;
  instructions: string;
}

export interface Bill {
  id: string;
  patientId: string;
  date: string;
  amount: number;
  details: string;
  status: 'Paid' | 'Unpaid';
}

export interface InsuranceDoc {
  id: string;
  patientId: string;
  fileName: string;
  uploadDate: string;
  fileUrl: string;
}

export interface NurseTask {
  id: string;
  nurseId: string;
  patientId: string;
  patientName: string;
  task: string;
  dueTime: string;
  status: 'Pending' | 'Completed';
}

export interface DischargeSummary {
  id: string;
  patientId: string;
  patientName: string;
  generationDate: string;
  status: 'Pending Approval' | 'Approved';
  patientInfo: {
    id: string;
    name: string;
    abhaId?: string;
  } | null;
  appointments: Appointment[];
  tests: TestRequest[];
  prescriptions: Prescription[];
}