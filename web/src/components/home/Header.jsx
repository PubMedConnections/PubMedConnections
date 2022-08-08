import { Link } from "react-router-dom"

const Header = (props) => {
	return (
		<header id='header'>
			<div className='intro'>
				<div className='overlay hero-img'>
					<div className='container'>
						<div className='row'>
							<div className='col-md-8 col-md-offset-2 intro-text'>
								<img src="img/logo.png" style={{ height: "200px" }} />
								<h1>PubMed Connections</h1>
								<p>PMC</p>
								<Link to="/connections">
									<button className='btn btn-custom btn-lg page-scroll'>
										Get Started
									</button>
								</Link>
								{/* <a href='' className='btn btn-custom btn-lg page-scroll'>Get Started</a> */}
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header;