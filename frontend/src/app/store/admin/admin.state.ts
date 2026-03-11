import { User } from '../../auth/auth.service';

export interface DriverApplication {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
  carModel: string;
  carYear: number;
  carPlate: string;
  carColor: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface RideStats {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  totalRevenue: number;
}

export interface AdminState {
  applications: DriverApplication[];
  users: User[];
  stats: RideStats | null;
  loading: boolean;
  error: string | null;
}

export const initialAdminState: AdminState = {
  applications: [],
  users: [],
  stats: null,
  loading: false,
  error: null
};
