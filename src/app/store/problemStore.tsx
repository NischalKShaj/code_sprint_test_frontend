// store for managing the state for the problems

// importing the required modules
import { create } from "zustand";

// creating the interface for the problems state
interface AllProblems {
  _id: string;
  title: string;
  category: string;
  difficulty: string;
  premium: boolean;
}

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  testCases: [];
  exampleTestCase: [];
  constraints: string;
  clientCode: string;
  premium: boolean;
}

// creating the state
interface State {
  problems: AllProblems[];
  showProblems: (problems: AllProblems[]) => void;
  problem: Problem | null;
  showProblem: (problem: Problem) => void;
}

// creating the store for problems
export const ProblemState = create<State>((set, get) => {
  let initialState = {
    problems: [],
    problem: null,
  };
  if (typeof window !== "undefined") {
    const savedState = localStorage.getItem("problemState");
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
    showProblems: (problems) => {
      set({ problems });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "problemState",
          JSON.stringify({ ...get(), problems })
        );
      }
    },
    showProblem: (problem) => {
      set({ problem });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "problemState",
          JSON.stringify({ ...get(), problem })
        );
      }
    },
  };
});
