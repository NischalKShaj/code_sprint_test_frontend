// file to create the button for the sign-up

import Link from "next/link";

const Signup = () => {
  return (
    <div className="flex justify-end items-center mt-4 sm:mt-0 mr-6 sm:mr-5">
      <Link href="/signup">
        <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl">
          Signup
        </button>
      </Link>
    </div>
  );
};

export default Signup;
