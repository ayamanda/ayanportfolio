import React from 'react';
import { HashLoader} from 'react-spinners';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-transparent">
      <HashLoader color="#ffffff" />
    </div>
  );
};

export default Loader;