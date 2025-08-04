import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Result = () => {
  const [image, setImage] = useState(assets.sample_img_1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const { generateImage, credit, user } = useContext(AppContext);
  const navigate = useNavigate();

  // ✅ Redirect user if not logged in or has 0 credits
  useEffect(() => {
    if (!user) {
      toast.warning("Please login to continue.");
      navigate("/");
    } else if (credit <= 0) {
      toast.info("You have 0 credits. Redirecting to Buy Credits...");
      navigate("/buycredit");
    }
  }, [user, credit, navigate]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    const result = await generateImage(input);
    if (result) {
      setImage(result);
      setIsImageLoaded(true);
    }

    setLoading(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center gap-6"
    >
      {/* Image Display */}
      <div>
        <div className="relative">
          <img src={image} alt="Generated" className="max-w-sm rounded" />
          <span
            className={`absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-[10s] ${loading ? 'w-full' : 'w-0'}`}
          />
        </div>
        {loading && <p className="text-gray-500 text-center mt-2">Loading...</p>}
      </div>

      {/* Input Prompt */}
      {!isImageLoaded && (
        <div className="flex w-full max-w-xl bg-neutral-500 text-white text-sm p-1 rounded-full overflow-hidden">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Describe what you want to generate"
            className="flex-1 bg-transparent outline-none px-4 py-2 text-white placeholder:text-gray-300"
          />
          <button
            type="submit"
            className="bg-zinc-900 px-6 sm:px-10 py-2 sm:py-3 text-white font-semibold rounded-full"
          >
            Generate
          </button>
        </div>
      )}

      {/* After Image Loaded */}
      {isImageLoaded && (
        <div className="flex gap-2 flex-wrap justify-center text-white text-sm p-0.5 mt-10 rounded-full">
          <p
            onClick={() => setIsImageLoaded(false)}
            className="bg-transparent border border-zinc-900 text-black px-8 py-3 rounded-full cursor-pointer"
          >
            Generate Another
          </p>
          <a
            href={image}
            download
            className="bg-zinc-900 px-10 py-3 rounded-full cursor-pointer"
          >
            Download
          </a>
        </div>
      )}
    </motion.form>
  );
};

export default Result;
