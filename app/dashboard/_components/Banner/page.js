import Link from 'next/link';
import React , {useState} from 'react'

function Banner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle the interests input here
    closeModal();
  };
  return (
    <div className='mb-7 w-4/5 mx-auto'>
      <h2 className='text-white ml-9 mt-7 font-bold font-serif pb-6'>Personality</h2>
      <div className="border-t  border-cyan-400 ml-9 w-10/12"></div>

      <br />
      <br />
      <div className='-ml-10 grid grid-flow-col gap-10'>
        <div className='border border-cyan-400 pb-3 rounded-sm w-64'>
          <img className='rounded-md object-cover w-full h-36' src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg" alt="" />
          <div className="border-t  border-cyan-400 "></div>
          <h1 className='text-white mt-4 text-2xl font-bold ml-3'>Test 1
          </h1>
          <Link href="/quiz-section/33">
            <img
              src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
              className="h-10 absolute top-80 ml-48 cursor-pointer mt-12"
              alt="Navigate to Quiz Section"
            />
          </Link>

          <div className='relative'>
            <p className='ml-3 text-white pt-8 w-4/5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae maiores molestias possimus optio nisi quos sint, quo facere est rem deserunt voluptas
            </p>
          </div>

        </div>
        <div className='border border-cyan-400 pb-3 rounded-sm w-64'>
          <img className='rounded-md object-cover w-full h-36' src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg" alt="" />
          <div className="border-t  border-cyan-400 "></div>
          <h1 className='text-white mt-4 text-2xl font-bold ml-3'>Test 2
          </h1>
          <img
            src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
            className="h-10 absolute top-80 ml-48 cursor-pointer mt-12"
            alt="Navigate to Quiz Section"
            onClick={openModal}
          />
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-md">
                <h2 className="text-xl font-bold mb-4">Enter Your Interests</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Your interests"
                    className="border border-gray-300 p-2 rounded w-full mb-4"
                  />
                  <button
                    type="submit"
                    className="bg-cyan-400 text-white px-4 py-2 rounded-md"
                  >
                    Submit
                  </button>
                </form>
                <button
                  className="mt-4 text-red-500"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className='relative'>
            <p className='ml-3 text-white pt-8 w-4/5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae maiores molestias possimus optio nisi quos sint, quo facere est rem deserunt voluptas
            </p>
          </div>
        </div>
        <div className='border border-cyan-400 pb-3 rounded-sm w-64'>
          <img className='rounded-md object-cover w-full h-36' src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg" alt="" />
          <div className="border-t  border-cyan-400 "></div>
          <h1 className='text-white mt-4 text-2xl font-bold ml-3'>Test 3
          </h1>
          <Link href="/quiz-section/33">
            <img
              src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
              className="h-10 absolute top-80 ml-48 cursor-pointer mt-12"
              alt="Navigate to Quiz Section"
            />
          </Link>

          <div className='relative'>
            <p className='ml-3 text-white pt-8 w-4/5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae maiores molestias possimus optio nisi quos sint, quo facere est rem deserunt voluptas
            </p>
          </div>
        </div>
        <div className='border border-cyan-400 pb-3 rounded-sm w-64'>
          <img className='rounded-md object-cover w-full h-36' src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg" alt="" />
          <div className="border-t  border-cyan-400 "></div>
          <h1 className='text-white mt-4 text-2xl font-bold ml-3'>Test 4
          </h1>
          <Link href="/quiz-section/1">
            <img
              src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
              className="h-10 absolute top-80 ml-48 cursor-pointer mt-12"
              alt="Navigate to Quiz Section"
            />
          </Link>

          <div className='relative'>
            <p className='ml-3 text-white pt-8 w-4/5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae maiores molestias possimus optio nisi quos sint, quo facere est rem deserunt voluptas
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Banner;