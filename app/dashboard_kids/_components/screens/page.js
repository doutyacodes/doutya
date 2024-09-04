import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const QuizTransitionScreens = ({ currentScreen, handleNextScreen }) => {
  const [exitAnimation, setExitAnimation] = useState(false);
  const [animationStages, setAnimationStages] = useState([false, false, false, false]);

  useEffect(() => {
    setExitAnimation(false);
    setAnimationStages([false, false, false, false]);

    const timers = [
      setTimeout(() => setAnimationStages(prev => [true, false, false, false]), 1000), // Delay for Hat
      setTimeout(() => setAnimationStages(prev => [true, true, false, false]), 2000), // Delay for Shell
      setTimeout(() => setAnimationStages(prev => [true, true, true, false]), 3000), // Delay for Star
      setTimeout(() => {
        setAnimationStages(prev => [true, true, true, true]);
        setExitAnimation(true);
      }, 4000) // Delay for Starfish
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [currentScreen]);

  const colors = ["#FF6F61", "#6B5B95", "#88B04B"];
  const images = [
    { src: "/assets/images/water.png", alt: "Image 1", className: "static-image" },
    { src: "/assets/images/hat.png", alt: "Image 2", className: "animate-slide-in-tl" },
    { src: "/assets/images/shell.png", alt: "Image 3", className: "animate-slide-in-tr" },
    { src: "/assets/images/star.png", alt: "Image 4", className: "animate-slide-in-bl" },
    { src: "/assets/images/starfish.png", alt: "Image 5", className: "animate-slide-in-br" }
  ];

  const imagePositions = [
    ["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"],
    ["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"],
    ["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"]
  ];

  return (
    <div className="fixed inset-0 w-screen h-screen" style={{ backgroundColor: colors[currentScreen - 1] }}>
      {/* Water Image */}
      <div className="absolute bottom-0 right-0 w-full h-full">
        <Image
          src="/assets/images/water.png"
          alt="Water Image"
          layout="fill"
          objectFit="cover"
          className="static-image"
        />
      </div>

      {/* Animated Images */}
      {images.slice(1).map((image, index) => (
        <div
          key={index}
          className={`absolute ${imagePositions[currentScreen - 1][index]} ${
            exitAnimation ? "animate-slide-out-" + imagePositions[currentScreen - 1][index] : (animationStages[index] ? image.className : "opacity-0")
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={150}
            height={150}
            className={image.className}
          />
        </div>
      ))}

      <div className="flex justify-center items-center h-full">
        <div className="rounded-2xl p-6 w-4/4 max-w-2xl h-auto text-center flex flex-col justify-center items-center bg-opacity-20 mt-[-200px]">
          <Image
            src="/assets/images/start2.png"
            alt="Quiz Start Image"
            width={600}
            height={600}
            className="mb-3"
          />
          {currentScreen === 3 ? (
            <Link href="/quiz-section-kids/1">
              <button className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-6 py-3 rounded-md text-lg font-bold hover:from-yellow-500 hover:to-pink-500 transition duration-300 ease-in-out transform hover:scale-105">
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

        /* Bounce Animation for Next Button */
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

        .opacity-0 {
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default QuizTransitionScreens;
