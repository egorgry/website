import Hero from "./components/Hero";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Achievements from "./components/Achievements";
import Extras from "./components/Extras";
import Footer from "./components/Footer";
import { profile, experience, skillGroups, achievements, extras } from "./data/resume";

export default function App() {
  return (
    <>
      <div className="grid-bg" aria-hidden="true" />
      <Hero profile={profile} />
      <Experience items={experience} />
      <Skills groups={skillGroups} />
      <Achievements items={achievements} />
      <Extras extras={extras} />
      <Footer profile={profile} />
    </>
  );
}
