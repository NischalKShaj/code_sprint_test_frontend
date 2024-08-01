import { create } from "zustand";

interface Chapter {
  chapterName: string;
  videos: string[];
}

interface Course {
  _id: string;
  course_name: string;
  description: string;
  course_category: string;
  chapters: Chapter[];
  price: number;
  tutor: string;
}

interface State {
  course: Course | null;
  showCourse: (course: Course) => void;
  allCourse: Course[];
  findAllCourse: (allCourse: Course[]) => void;
  isSubscribed: {
    [x: string]: any;
    user_id: string | undefined;
    username: string | undefined;
    course_name: string | undefined;
    course_category: string | undefined;
    description: string | undefined;
    tutor_id: string;
    course_id: string;
  }[];
  subscribe: (
    isSubscribed: {
      user_id: string | undefined;
      username: string | undefined;
      course_name: string | undefined;
      course_category: string | undefined;
      description: string | undefined;
      tutor_id: string;
      course_id: string;
    }[]
  ) => void;
  unsubscribe: (courseId: string | undefined) => void;
  completedVideos: Record<string, Record<string, boolean>>;
  toggleVideoCompletion: (courseId: string, videoUrl: string) => void;

  myCourse: Course | null;

  setMyCourse: (myCourse: Course) => void;
}

// Creating the store
export const CourseState = create<State>((set, get) => {
  let initialState = {
    course: null,
    allCourse: [],
    isSubscribed: [],
    completedVideos: {},
    myCourse: null,
  };
  if (typeof window !== "undefined") {
    const savedState = localStorage.getItem("courseState");
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
    showCourse: (course) => {
      set({ course });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "courseState",
          JSON.stringify({ ...get(), course })
        );
      }
    },
    findAllCourse(allCourse) {
      set({ allCourse });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "courseState",
          JSON.stringify({ ...get(), allCourse })
        );
      }
    },
    subscribe(isSubscribed) {
      set({ isSubscribed });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "courseState",
          JSON.stringify({ ...get(), isSubscribed })
        );
      }
    },
    unsubscribe(courseId) {
      const updatedSubscribed = get().isSubscribed.filter(
        (course) => course.course_id !== courseId
      );
      set({ isSubscribed: updatedSubscribed });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "courseState",
          JSON.stringify({ ...get(), isSubscribed: updatedSubscribed })
        );
      }
    },
    toggleVideoCompletion(courseId, videoUrl) {
      const { completedVideos } = get();
      console.log("completedVideos:", completedVideos); // Log completedVideos
      console.log("courseId:", courseId); // Log courseId

      // Initialize completedVideos as an empty object if it's undefined
      const currentCompletedVideos = completedVideos || {};

      // Access courseCompletion from currentCompletedVideos
      const courseCompletion = currentCompletedVideos[courseId] || {};
      courseCompletion[videoUrl] = !courseCompletion[videoUrl];

      set({
        // Update completedVideos with courseId and updated courseCompletion
        completedVideos: {
          ...currentCompletedVideos,
          [courseId]: courseCompletion,
        },
      });

      // Update localStorage with the updated state
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "courseState",
          JSON.stringify({
            ...get(),
            completedVideos: {
              ...currentCompletedVideos,
              [courseId]: courseCompletion,
            },
          })
        );
      }
    },

    setMyCourse(myCourse) {
      set({ myCourse });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "courseState",
          JSON.stringify({ ...get(), myCourse })
        );
      }
    },
  };
});
