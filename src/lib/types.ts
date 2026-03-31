export type EventCategory =
  | "academic"
  | "sports"
  | "social"
  | "arts"
  | "tech"
  | "health"
  | "career"
  | "clubs";

export type EventStatus = "pending" | "approved" | "rejected";

export type UserRole = "user" | "organizer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  time: string;
  endTime?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  category: EventCategory;
  status: EventStatus;
  image: string;
  organizerId: string;
  organizerName: string;
  registrationLink?: string;
  isFeatured: boolean;
  rsvpCount: number;
  capacity?: number;
  createdAt: string;
  isVirtual?: boolean;
  virtualLink?: string;
}

export interface RSVP {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  eventId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  academic: {
    label: "Academic",
    color: "text-indigo-700 dark:text-indigo-300",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/40",
    icon: "GraduationCap",
  },
  sports: {
    label: "Sports",
    color: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
    icon: "Trophy",
  },
  social: {
    label: "Social",
    color: "text-rose-700 dark:text-rose-300",
    bgColor: "bg-rose-100 dark:bg-rose-900/40",
    icon: "Users",
  },
  arts: {
    label: "Arts & Culture",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-100 dark:bg-purple-900/40",
    icon: "Palette",
  },
  tech: {
    label: "Technology",
    color: "text-cyan-700 dark:text-cyan-300",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/40",
    icon: "Cpu",
  },
  health: {
    label: "Health & Wellness",
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-100 dark:bg-amber-900/40",
    icon: "Heart",
  },
  career: {
    label: "Career",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/40",
    icon: "Briefcase",
  },
  clubs: {
    label: "Clubs & Orgs",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100 dark:bg-orange-900/40",
    icon: "Flag",
  },
};
