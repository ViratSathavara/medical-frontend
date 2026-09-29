export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'STAFF';
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePicture?: string;
  patientId?: string;
  doctorId?: string;
}

export interface Patient {
  _id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  allergies?: string[];
  existingConditions?: string[];
  assignedDoctor?: Doctor;
}

export interface Doctor {
  _id: string;
  doctorId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  department: Department;
  qualifications: string[];
  experienceYears: number;
  consultationFee: number;
  availableDays: string[];
  roomNumber?: string;
  phone?: string;
  rating?: number;
  totalReviews?: number;
  status?: string;
  bio?: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  icon?: string;
  doctorCount?: number;
  headDoctor?: Doctor;
}

export interface Appointment {
  _id: string;
  appointmentNumber: string;
  patient: Patient;
  doctor: Doctor;
  department: Department;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  reason: string;
  symptoms?: string[];
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Rejected' | 'Rescheduled' | 'Completed' | 'Cancelled' | 'No-show';
  paymentStatus: 'Pending' | 'Paid' | 'Partially Paid';
  consultationFee: number;
  createdAt: string;
}

export interface MedicalRecord {
  _id: string;
  recordNumber: string;
  patient: Patient;
  doctor: Doctor;
  visitDate: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  clinicalNotes?: string;
  vitalSigns?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };
  allergies?: string[];
  prescriptions?: Prescription[];
  labReports?: LabReport[];
}

export interface MedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  _id: string;
  prescriptionNumber: string;
  patient: Patient;
  doctor: Doctor;
  diagnosis: string;
  medicines: MedicineItem[];
  notes?: string;
  issueDate: string;
  pdfUrl?: string;
  dispensed?: boolean;
}

export interface Medicine {
  _id: string;
  name: string;
  genericName?: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  minStockAlert: number;
  purchasePrice: number;
  sellingPrice: number;
  unit: string;
}

export interface LabTest {
  _id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  normalRange: string;
  units: string;
  sampleType: string;
}

export interface LabReport {
  _id: string;
  reportNumber: string;
  patient: Patient;
  doctor: Doctor;
  results: {
    testName: string;
    result: string;
    normalRange: string;
    units: string;
    flag: 'Normal' | 'Abnormal' | 'Critical';
  }[];
  pdfUrl?: string;
  completedAt: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  patient: Patient;
  items: {
    description: string;
    category: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: 'Pending' | 'Paid' | 'Partially Paid';
  dueDate: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  totalBeds: number;
  dailyRate: number;
  availableBeds?: number;
  occupiedBeds?: number;
  beds?: Bed[];
}

export interface Bed {
  _id: string;
  bedNumber: string;
  room: string | Room;
  bedType: string;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  dailyRate: number;
  currentPatient?: Patient;
}

export interface EmergencyCase {
  _id: string;
  caseNumber: string;
  patientName: string;
  age?: number;
  gender?: string;
  contactPhone?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  symptoms: string;
  initialDiagnosis?: string;
  triageNotes?: string;
  attendingDoctor?: Doctor;
  status: string;
  arrivalTime: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}
