export type AppView = "home" | "events" | "matches" | "groups" | "profile";
export type AuthMode = "login" | "signup";

// ---- DB types ----
export interface DBProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  pronouns: string | null;
  mbti: string | null;
  bio: string | null;
  degree: string | null;
  year_of_study: string | null;
  avatar_url: string | null;
  interests: string[];
  weekend_style: string[];
  music_taste: string[];
  trying_to_meet: string[];
  preferred_event_vibe: string | null;
  conversation_style: string | null;
  ideal_hangout: string | null;
  fun_fact: string | null;
  social_energy: number;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  society: string | null;
  date: string | null;
  location: string | null;
  max_group_size: number;
}

export interface MatchGroup {
  id: string;
  event_id: string;
  members: DBProfile[];
}

// ---- Legacy form types (kept for UI compatibility) ----
export type ProfileFormData = {
  username: string;
  password: string;
  profilePictureFile: File | null;
  profilePicturePreview: string;
  firstName: string;
  lastName: string;
  age: string;
  degree: string;
  yearOfStudy: string;
  pronouns: string;
  mbti: string;
  bio: string;
  interests: string[];
  preferredEventVibe: string;
  socialEnergy: number;
  conversationStyle: string;
  weekendStyle: string[];
  musicTaste: string[];
  idealHangout: string;
  tryingToMeet: string[];
  funFact: string;
};

export const chipOptions = [
  "Sport", "Gym", "Music", "Gaming", "Movies", "Reading", "Coding",
  "Content creation", "Coffee runs", "Hiking", "Food", "Anime",
  "Travelling", "Photography", "Fashion", "Art",
];

export const initialProfileData: ProfileFormData = {
  username: "",
  password: "",
  profilePictureFile: null,
  profilePicturePreview: "",
  firstName: "",
  lastName: "",
  age: "",
  degree: "",
  yearOfStudy: "",
  pronouns: "",
  bio: "",
  interests: [],
  preferredEventVibe: "",
  socialEnergy: 3,
  conversationStyle: "",
  weekendStyle: [],
  musicTaste: [],
  idealHangout: "",
  tryingToMeet: [],
  funFact: "",
  mbti: "",
};
