export type AppView =
  | "auth"
  | "profile-setup"
  | "home"
  | "events"
  | "matches"
  | "groups"
  | "profile";

export type AuthMode = "login" | "signup";

export type EventItem = {
  id: string;
  society: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  signedUp: boolean;
};

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
  "Sport",
  "Gym",
  "Music",
  "Gaming",
  "Movies",
  "Reading",
  "Coding",
  "Content creation",
  "Coffee runs",
  "Hiking",
  "Food",
  "Anime",
  "Travelling",
  "Photography",
  "Fashion",
  "Art",
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
};