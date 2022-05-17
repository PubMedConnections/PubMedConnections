import { useState, useEffect } from "react";
import { Home_Navigation } from "./components/Navigation";
import { Header } from "./components/Header";
import { Team } from "./components/Team";
import JsonData from "./components/Team.json";
import SmoothScroll from "smooth-scroll";

export const scroll = new SmoothScroll('a[href*="#"]', {
    speed: 1000,
    speedAsDuration: true,
});

function Home() {

    const [landingPageData, setLandingPageData] = useState({});
    useEffect(() => {
        setLandingPageData(JsonData);
    }, []);


    return (
        <div>
            <Home_Navigation />
            <Header />
            <Team data={landingPageData.Team} />
        </div>
    );
}


export default Home;
