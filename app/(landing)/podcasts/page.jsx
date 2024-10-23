import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";

export default function PodcastPage() {
    const podcasts = [
      {
        id: 1,
        title: 'How to build a world-class business brand',
        description: 'Lorem ipsum at vero eos et accusam et justo duo dolores et ea rebum.',
        imageUrl: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg',
        audioUrl: '/assets/podcasts/podcast1.mp3',
      },
      // {
      //   id: 2,
      //   title: 'Getting the first 100 customers for your business',
      //   description: 'Lorem ipsum at vero eos et accusam et justo duo dolores et ea rebum.',
      //   imageUrl: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg',
      //   audioUrl: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
      // },
      // {
      //   id: 3,
      //   title: 'Should I raise money for my startup, or not?',
      //   description: 'Lorem ipsum at vero eos et accusam et justo duo dolores et ea rebum.',
      //   imageUrl: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg',
      //   audioUrl: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
      // },
    ];
  
    return (
      <div className="bg-gray-100 min-h-screen ">
        <Header />
        <div className="max-w-6xl mx-auto p-8">
          {/* Featured Section */}
          <div className="bg-purple-600 text-white p-6 rounded-lg mb-12">
            <h1 className="text-4xl font-bold">A UX Case Study on Creating a Studious Environment</h1>
            <p className="mt-4">Apparently we had reached a great height in the atmosphere, for the sky was a dead black, and the stars had ceased to twinkle.</p>
            <button className="mt-6 px-4 py-2 bg-green-500 rounded-lg">Listen Now</button>
          </div>
  
          {/* Recent Episodes */}
          <h2 className="text-3xl font-semibold mb-8">Recent Episodes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {podcasts.map((podcast) => (
              <div key={podcast.id} className="bg-white shadow-lg rounded-lg p-6">
                <img src={podcast.imageUrl} alt={podcast.title} className="w-full h-40 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-semibold">{podcast.title}</h3>
                <p className="text-gray-600 mt-2 mb-4">{podcast.description}</p>
                <audio controls className="w-full">
                  <source src={podcast.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ))}
          </div>
        </div>
        <Footer />

      </div>
    );
  }
  