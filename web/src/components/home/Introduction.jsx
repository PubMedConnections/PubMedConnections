import { Link } from 'react-router-dom';

const Introduction = (props) => {
  return (
    <div id="introduction">
        <div className="overlay"></div>
        <div className="intro">
            <img className="logo" src='/img/logo.png' alt="PubMed Connections Logo" />
            <h1>PubMed Connections</h1>
            <Link to='/connections'>
                <button className='btn btn-custom btn-lg page-scroll'>
                    Get Started
                </button>
            </Link>
        </div>
    </div>
  );
};

export default Introduction;
