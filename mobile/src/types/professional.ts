export type Professional = {
  id: string;
  fullName: string;
  specialtyId: string;
  specialty: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};
