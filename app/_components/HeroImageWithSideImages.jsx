import Image from "next/image";

const HeroImageWithSideImages = ({ loading, setLoading }) => {
  return (
    <div className="relative p-3">
      <div className="relative w-full h-96">
        {loading && (
          <div className="w-full h-96 bg-[rgba(256,256,256,0.2)] rounded-lg flex justify-center items-center">
            <div className="w-6 h-6 border-4 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
          </div>
        )}
        <Image
          src={
            "https://images.pexels.com/photos/3653849/pexels-photo-3653849.jpeg"
          }
          fill
          alt="hero-img"
          className="rounded-lg object-cover"
          onLoad={() => setLoading(false)}
        />

        {/* Left Image */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-16 h-16 outline outline-white rounded-lg">
          <Image
            fill
            src={
              "https://images.pexels.com/photos/7092518/pexels-photo-7092518.jpeg"
            }
            alt="left-img"
            className="rounded-lg"
          />
        </div>

        {/* Right Image */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-16 h-16 outline outline-white rounded-lg">
          <Image
            fill
            src={
              "https://images.pexels.com/photos/7092518/pexels-photo-7092518.jpeg"
            }
            alt="right-img"
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroImageWithSideImages;
