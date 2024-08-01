// pages/404.js

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="relative h-[600px] overflow-hidden bg-purple bg-cover bg-center"
      style={{
        backgroundImage: "url(http://salehriaz.com/404Page/img/bg_purple.png)",
      }}
    >
      <div
        className="absolute inset-0 bg-repeat bg-cover"
        style={{
          backgroundImage:
            "url(http://salehriaz.com/404Page/img/overlay_stars.svg)",
        }}
      ></div>
      <div className="flex justify-between items-center p-4"></div>
      <div className="text-center pt-64">
        <img
          className="mx-auto z-100 pointer-events-none"
          src="http://salehriaz.com/404Page/img/404.svg"
          width="300px"
        />
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <img
          className="absolute transform -translate-x-12 top-3/4 animate-rocket-movement"
          src="http://salehriaz.com/404Page/img/rocket.svg"
          width="40px"
        />
        <div className="absolute top-1/4 left-1/4">
          <img
            className="z-90"
            src="http://salehriaz.com/404Page/img/earth.svg"
            width="100px"
            style={{ animation: "spin-earth 100s infinite linear" }}
          />
          <img
            className="absolute top-1/4 left-1/4"
            src="http://salehriaz.com/404Page/img/moon.svg"
            width="80px"
          />
        </div>
        <div className="absolute top-3/4 right-1/4 animate-move-astronaut">
          <img
            className="animate-rotate-astronaut"
            src="http://salehriaz.com/404Page/img/astronaut.svg"
            width="140px"
          />
        </div>
      </div>
      <div className="absolute inset-0">
        <div className="absolute top-4/5 left-1/4 bg-white rounded-full w-3 h-3 opacity-30 animate-glow-star delay-1s"></div>
        <div className="absolute top-1/5 left-2/5 bg-white rounded-full w-3 h-3 opacity-30 animate-glow-star delay-3s"></div>
        <div className="absolute top-1/4 left-1/4 bg-white rounded-full w-3 h-3 opacity-30 animate-glow-star delay-5s"></div>
        <div className="absolute top-3/4 left-4/5 bg-white rounded-full w-3 h-3 opacity-30 animate-glow-star delay-7s"></div>
        <div className="absolute top-9/10 left-1/2 bg-white rounded-full w-3 h-3 opacity-30 animate-glow-star delay-9s"></div>
      </div>
    </div>
  );
}

const styles = `
@keyframes rocket-movement {
  100% { transform: translate(1200px, -600px); }
}
@keyframes spin-earth {
  100% { transform: rotate(-360deg); transition: transform 20s; }
}
@keyframes move-astronaut {
  100% { transform: translate(-160px, -160px); }
}
@keyframes rotate-astronaut {
  100% { transform: rotate(-720deg); }
}
@keyframes glow-star {
  40% { opacity: 0.3; }
  90%, 100% { opacity: 1; transform: scale(1.2); border-radius: 999999px; }
}
@layer utilities {
  .animate-rocket-movement {
    animation: rocket-movement 200s linear infinite both running;
  }
  .animate-spin-earth {
    animation: spin-earth 100s infinite linear both;
  }
  .animate-move-astronaut {
    animation: move-astronaut 50s infinite linear both alternate;
  }
  .animate-rotate-astronaut {
    animation: rotate-astronaut 200s infinite linear both alternate;
  }
  .animate-glow-star {
    animation: glow-star 2s infinite ease-in-out alternate;
  }
  .delay-1s {
    animation-delay: 1s;
  }
  .delay-3s {
    animation-delay: 3s;
  }
  .delay-5s {
    animation-delay: 5s;
  }
  .delay-7s {
    animation-delay: 7s;
  }
  .delay-9s {
    animation-delay: 9s;
  }
}
`;
