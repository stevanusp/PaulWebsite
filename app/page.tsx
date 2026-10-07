import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Story from "@/components/story/Story";
import Work from "@/components/Work";
import FieldNotes from "@/components/FieldNotes";
import Built from "@/components/Built";
import Path from "@/components/Path";
import ByEar from "@/components/ByEar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Story />
        <Work />
        <FieldNotes />
        <Built />
        <Path />
        <ByEar />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
