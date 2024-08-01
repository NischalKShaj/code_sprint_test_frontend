// button for login

import Link from "next/link";

const Login = () => {
  return (
    <div className="flex justify-end items-center mt-4 sm:mt-0 mr-4 sm:mr-3">
      <Link href="/login">
        <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl">
          Login
        </button>
      </Link>
    </div>
  );
};

export default Login;
