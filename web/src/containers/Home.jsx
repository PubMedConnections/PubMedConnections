import { useState, useEffect } from "react";
import { HomeNavigation } from "../components/navigation";
import { Header, TeamDescription } from "../components/home";
import JsonData from "../json/teamMembers.json";
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
            <TeamDescription data={landingPageData.Team} />
        </div>
    );
}


export default Home;
