export interface User {
    id: number;
    fullName: string;
    phone: string;
    password: string;
    role: 'ADMIN' | 'DRIVER' | 'MATE' | 'PASSENGER';
};