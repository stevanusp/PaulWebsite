import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Method from "@/components/Method";
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
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Method />
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
