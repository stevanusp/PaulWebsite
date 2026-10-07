// The page behind the page: one long post, for whoever keeps scrolling past the end.
// Its text lives here, apart from content/site.ts, so it only ever loads with that page
// (it is never in the HTML, so it is never indexed). House rule as everywhere: no em dashes.
//
// Placeholder for now. Every string below is filler that only holds the shape of the writing;
// the real post replaces it.

export type Part = { title: string; paragraphs: readonly string[] };

export const hidden = {
  title: "A placeholder title for the long post",
  intro:
    "This first screen is the cover. The finished post opens here, with a line or two that sets up everything below it.",
  parts: [
    {
      title: "First part",
      paragraphs: [
        "Placeholder text. This paragraph only holds the shape of the writing to come, so the page can be built and read before the words exist.",
        "A second paragraph of filler, a little longer than the first, to show how a full block of reading sits on the page, how long a line feels, and where the eye rests between one idea and the next.",
        "A short one to close the part.",
      ],
    },
    {
      title: "Second part",
      paragraphs: [
        "More filler. As you read on, the drawing beside the text follows along, so each part of the post can have its own moment in the picture.",
        "This paragraph stands in for a longer thought. It runs on for a few lines on purpose, the way a real paragraph would, so the spacing and rhythm of the page can be judged before the real sentences arrive.",
        "And one more, of middling length, to make the part feel like a part.",
      ],
    },
    {
      title: "Third part",
      paragraphs: [
        "Placeholder again. The middle of a post is usually the longest stretch, so this part carries a little more text than the others.",
        "Here the writing would slow down and go deeper. For now these lines only take up the room that writing will take, so nothing about the layout has to be guessed later.",
        "A paragraph to let the reader breathe, short and plain.",
        "And a last one in this part, long enough to wrap across several lines on a phone and a couple on a wide screen, which is where most of the reading will happen.",
      ],
    },
    {
      title: "Fourth part",
      paragraphs: [
        "Filler that leads toward the end. The picture should be close to its final state by now.",
        "A longer placeholder paragraph to keep the scroll honest: the stage stays in place, the text keeps moving, and the drawing keeps pace with whichever part is in the middle of the screen.",
      ],
    },
    {
      title: "Fifth part",
      paragraphs: [
        "The last part of the placeholder. In the real post, this is where everything comes together.",
        "One final paragraph of filler, so the end of the page has the same weight as the rest of it.",
      ],
    },
  ] satisfies Part[],
  signoff: "End of the placeholder. The real ending goes here.",
} as const;
