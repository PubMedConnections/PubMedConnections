import { useState, useEffect } from "react";
import { HomeNavigation } from "./components/Navigation";
import { Header } from "./components/Header";
import { Team } from "./components/Team";
import JsonData from "../json/data.json";
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
            <HomeNavigation />
            <Header />
            <Team data={landingPageData.Team} />
        </div>
    );
}


export default Home;
