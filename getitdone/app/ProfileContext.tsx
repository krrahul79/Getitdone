import React, { createContext, useContext, useState } from "react";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at?: string;
};

const ProfileContext = createContext<{
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
}>({ profile: null, setProfile: () => {} });

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
