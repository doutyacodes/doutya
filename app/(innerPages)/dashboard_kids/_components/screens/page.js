import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Custom hook to determine if the screen is mobile
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

const QuizTransitionScreens = ({ currentScreen, handleNextScreen }) => {
  const [exitAnimation, setExitAnimation] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 768px)"); 

  useEffect(() => {
    setExitAnimation(false);

    const timer = setTimeout(() => {
      setExitAnimation(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentScreen]);

  const colors = ["#FF6F61", "#6B5B95"];
  const images = [
    { src: "/assets/images/water.png", alt: "Image 1", className: "animate-slide-in-bc" },
    { src: "/assets/images/hat.png", alt: "Image 2", className: "animate-slide-in-tl" },
    { src: "/assets/images/shell.png", alt: "Image 3", className: "animate-slide-in-tr" },
    { src: "/assets/images/star.png", alt: "Image 4", className: "animate-slide-in-bl" },
    { src: "/assets/images/starfish.png", alt: "Image 5", className: "animate-slide-in-br" }
  ];

  const imagePositions = [
    ["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"],
    ["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"]
  ];

  return (
    <div className="fixed inset-0 w-screen h-screen" style={{ backgroundColor: colors[currentScreen - 1] }}>
      {/* Water Image */}
      <div className="absolute bottom-0 left-0 w-full h-full">
        <Image
          src="/assets/images/water.png"
          alt="Water Image"
          layout="fill"
          objectFit="cover"
          className={`static-image ${images[0].className}`}
        />
      </div>

      {/* Animated Images */}
      {images.slice(1).map((image, index) => (
        <div
          key={index}
          className={`absolute ${imagePositions[currentScreen - 1][index]} ${
            exitAnimation ? "animate-slide-out-" + imagePositions[currentScreen - 1][index] : image.className
          }`}
          style={{ marginBottom: isMobile && index >= 2 ? "60px" : "0" }} 
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={isMobile ? 100 : 220} 
            height={isMobile ? 100 : 220} 
            className={`responsive-image ${image.className}`}
          />
        </div>
      ))}

      <div className="flex justify-center items-center h-full">
        <div className="rounded-2xl p-6 w-4/4 max-w-2xl h-auto text-center flex flex-col justify-center items-center bg-opacity-20 mt-[-200px]">
          <Image
            src={currentScreen === 1 ? "/assets/images/start2.png" : "/assets/images/areyouready.gif"}
            alt={currentScreen === 1 ? "Quiz Start Image" : "Are You Ready Image"}
            width={isMobile ? 300 : 600} 
            height={isMobile ? 300 : 600} 
            className="mb-3 responsive-main-image"
          />
          {currentScreen === 2 ? (
            <Link href="/quiz-section-kids/1">
              <button className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-6 py-3 rounded-md text-lg font-bold hover:from-yellow-500 hover:to-pink-500 transition duration-300 ease-in-out transform hover:scale-105 animate-bounce">
                Go to Quiz
              </button>
            </Link>
          ) : (
            <button
              onClick={handleNextScreen}
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-9 py-3 rounded-md text-lg font-bold hover:from-teal-500 hover:to-blue-500 transition duration-300 ease-in-out transform hover:scale-105 animate-bounce"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Slide-in Animations */
        @keyframes slideInFromTopLeft {
          0% {
            transform: translate(-100%, -100%);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0);
            opacity: 1;
          }
        }

        @keyframes slideInFromTopRight {
          0% {
            transform: translate(100%, -100%);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0);
            opacity: 1;
          }
        }

        @keyframes slideInFromBottomLeft {
          0% {
            transform: translate(-100%, 100%);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0);
            opacity: 1;
          }
        }

        @keyframes slideInFromBottomRight {
          0% {
            transform: translate(100%, 100%);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0);
            opacity: 1;
          }
        }

        @keyframes slideInFromBottomCenter {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Slide-out Animations */
        @keyframes slideOutToTopLeft {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(-100%, -100%);
            opacity: 0;
          }
        }

        @keyframes slideOutToTopRight {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(100%, -100%);
            opacity: 0;
          }
        }

        @keyframes slideOutToBottomLeft {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(-100%, 100%);
            opacity: 0;
          }
        }

        @keyframes slideOutToBottomRight {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(100%, 100%);
            opacity: 0;
          }
        }

        /* Bounce Animation for Buttons */
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Animation Classes */
        .animate-slide-in-tl {
          animation: slideInFromTopLeft 1s ease forwards;
        }

        .animate-slide-in-tr {
          animation: slideInFromTopRight 1s ease forwards;
        }

        .animate-slide-in-bl {
          animation: slideInFromBottomLeft 1s ease forwards;
        }

        .animate-slide-in-br {
          animation: slideInFromBottomRight 1s ease forwards;
        }

        .animate-slide-in-bc {
          animation: slideInFromBottomCenter 1s ease forwards;
        }

        .animate-slide-out-tl {
          animation: slideOutToTopLeft 1s ease forwards;
        }

        .animate-slide-out-tr {
          animation: slideOutToTopRight 1s ease forwards;
        }

        .animate-slide-out-bl {
          animation: slideOutToBottomLeft 1s ease forwards;
        }

        .animate-slide-out-br {
          animation: slideOutToBottomRight 1s ease forwards;
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        /* Optional: Smooth Opacity Transition for Static Image */
        .static-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Responsive Image Scaling */
        .responsive-image {
          width: auto;
          height: auto;
        }

        .responsive-main-image {
          width: auto;
          height: auto;
        }
      `}</style>
    </div>
  );
};

export default QuizTransitionScreens;
