import { Link } from "react-router-dom"

export const HomeNavigation = (props) => {
  return (
    <nav id='menu' className='navbar navbar-default navbar-fixed-top'>
      <div className='container'>
        <div className='navbar-header'>
          <button
            type='button'
            className='navbar-toggle collapsed'
            data-toggle='collapse'
            data-target='#bs-example-navbar-collapse-1'
          >

            <span className='sr-only'>Toggle navigation</span>
            <span className='icon-bar'></span>
            <span className='icon-bar'></span>
            <span className='icon-bar'></span>
          </button>
          <a className='navbar-brand page-scroll' href='#page-top'>
            PubMed Connections
          </a>
        </div>

        <div
          className='collapse navbar-collapse'
          id='bs-example-navbar-collapse-1'
        >
          <ul className='nav navbar-nav navbar-right'>
            <li><a href='#page-top' className='page-scroll'>Home</a></li>
            <li><a href='#team' className='page-scroll'>Team</a></li>
            <li><Link to="/connections">Get Started</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  )
}


export const OtherNavigation = (props) => {
  return (
    <nav id='menu' className='navbar navbar-default navbar-fixed-top'>
      <div className='container'>
        <div className='navbar-header'>
          <button
            type='button'
            className='navbar-toggle collapsed'
            data-toggle='collapse'
            data-target='#bs-example-navbar-collapse-1'
          >

            <span className='sr-only'>Toggle navigation</span>
            <span className='icon-bar'></span>
            <span className='icon-bar'></span>
            <span className='icon-bar'></span>
          </button>
          <Link className='navbar-brand' to="/home">
            PubMed Connections
            </Link>
        </div>

        <div
          className='collapse navbar-collapse'
          id='bs-example-navbar-collapse-1'
        >
          <ul className='nav navbar-nav navbar-right'>
            <li><Link to="/home">Home</Link></li>
            {/* <li><Link to="/connections">Get Started</Link></li>
            <li><Link to="/login">Login</Link></li> */}
          </ul>
        </div>
      </div>
    </nav>
  )
}