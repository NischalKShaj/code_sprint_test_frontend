// store/index.tsx
import { create } from "zustand";

// Creating the interface for the state of the application
interface State {
  // for checking whether user is valid or not
  isAuthorized: boolean;
  // for adding the user details to the state
  user: {
    id: string;
    email: string;
    role: string;
    username: string;
    profileImage: string;
    blocked: boolean;
    phone: string | null;
    isOnline: boolean;
    premium: boolean;
  } | null;
  // function for implementing the userLogin
  isLoggedIn: (user: {
    id: string;
    email: string;
    role: string;
    username: string;
    profileImage: string;
    blocked: boolean;
    phone: string | null;
    isOnline: boolean;
    premium: boolean;
  }) => void;
  // function for implementing the user Logout
  isLoggedOut: () => void;
  // to check whether there is a valid admin
  isAdmin: boolean;
  admin: { email: string } | null;
  // for logging in purpose
  isAdminLoggedIn: (admin: { email: string }) => void;
  // for logout purpose
  isAdminLoggedOut: () => void;
  // for displaying all the users
  allUser: {
    id: string;
    username: string;
    email: string;
    profileImage: string;
    block: boolean;
    isOnline: boolean;
  }[];
  // function to show all the users
  findAllUsers: (
    allUser: {
      id: string;
      username: string;
      email: string;
      profileImage: string;
      block: boolean;
      isOnline: boolean;
    }[]
  ) => void;
  //  show all the tutors
  allTutor: {
    id: string;
    username: string;
    email: string;
    profileImage: string;
    block: boolean;
    isOnline: boolean;
  }[];
  // function for showing all the tutor
  findAllTutor: (
    allTutor: {
      id: string;
      username: string;
      email: string;
      profileImage: string;
      block: boolean;
      isOnline: boolean;
    }[]
  ) => void;
  // function to block and unblock the user
  blockUnblock: (id: string, status: boolean) => void;
  block_unblock: (id: string, status: boolean) => void;
}

export const AppState = create<State>((set, get) => {
  let initialState = {
    isAuthorized: false,
    user: null,
    isAdmin: false,
    admin: null,
    allUser: [],
    allTutor: [],
    editUserDetails: null,
  };

  if (typeof window !== "undefined") {
    const savedState = localStorage.getItem("appState");
    if (savedState) {
      try {
        initialState = JSON.parse(savedState);
      } catch (error) {
        console.error("Error parsing saved state:", error);
      }
    }
  }

  return {
    ...initialState,
    isLoggedIn: (user) => {
      set({ isAuthorized: true, user });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "appState",
          JSON.stringify({ ...get(), isAuthorized: true, user })
        );
      }
    },
    isLoggedOut: () => {
      set({ isAuthorized: false, user: null });
      if (typeof window !== "undefined") {
        localStorage.removeItem("appState");
      }
    },
    isAdminLoggedIn: (admin) => {
      set({ isAdmin: true, admin });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "appState",
          JSON.stringify({ ...get(), isAdmin: true, admin })
        );
      }
    },
    isAdminLoggedOut: () => {
      set({ isAdmin: false, admin: null });
      if (typeof window !== "undefined") {
        localStorage.removeItem("appState");
      }
    },
    findAllUsers: (allUser) => {
      set({ allUser });
      if (typeof window !== "undefined") {
        localStorage.setItem("appState", JSON.stringify({ ...get(), allUser }));
      }
    },
    findAllTutor: (allTutor) => {
      set({ allTutor });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "appState",
          JSON.stringify({ ...get(), allTutor })
        );
      }
    },
    blockUnblock: (id, status) => {
      set((state) => {
        const updatedTutors = state.allTutor.map((tutor) =>
          tutor.id === id ? { ...tutor, block: status } : tutor
        );
        return { ...state, allTutor: updatedTutors };
      });
    },
    block_unblock: (id, status) => {
      set((state) => {
        const updatedUser = state.allUser.map((user) =>
          user.id === id ? { ...user, block: status } : user
        );
        return { ...state, allUser: updatedUser };
      });
    },
  };
});
