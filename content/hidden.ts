// The page behind the page: one post, for whoever keeps scrolling past the end.
// It loads only with that page (it is never in the HTML, so it is never indexed).
// The words are Paulus's own, kept exactly as written. The story only decides where each line
// stops for a moment, and which lines of a stanza arrive one by one.
// House rule as everywhere: no em dashes.

export type Beat = {
  /** Names the moment, so the drawing can follow it (components/hidden/art.ts). */
  id: string;
  /** One line, or a stanza whose lines arrive one by one. */
  lines: readonly string[];
  /** Short lines can be set larger. */
  size?: "big" | "huge";
};

export const hidden = {
  beats: [
    { id: "oh", lines: ["Oh."], size: "huge" },
    { id: "huh", lines: ["Huh?"], size: "huge" },
    { id: "still", lines: ["You’re still here?"], size: "big" },
    { id: "glad", lines: ["I’m really glad you wanted to know more. Congratulations."] },
    { id: "found", lines: ["You’ve found a part of me that I rarely show to other people."] },
    {
      id: "share",
      lines: [
        "So, I thought I’d share a few things that have been on my mind today. Hopefully, something here can help you. And please, feel free to talk to me too.",
      ],
    },
    { id: "parts", lines: ["I think there are three parts to being human: the mind, the body, and the heart."] },
    {
      id: "carry",
      lines: ["We carry all three with us as we wander through life, trying to figure out where we’re going."],
    },
    { id: "forget", lines: ["But somewhere along the way, we tend to forget a lot of things."] },
    { id: "alive", lines: ["Sometimes, we forget to simply enjoy being alive."] },
    {
      id: "change",
      lines: ["As time goes by, our destinations may change, but the experiences we gather along the way stay with us."],
    },
    { id: "lost", lines: ["So, it’s okay to lose your way sometimes."] },
    { id: "wander", lines: ["It’s okay to just wander around for a while."] },
    {
      id: "answers",
      lines: [
        "We don’t have to, and probably never will, find every answer to every question we have all at once. Everything has its own time.",
      ],
    },
    {
      id: "times",
      lines: ["There is a time to keep walking.", "There is a time to rest.", "And sometimes, there is a time to cry."],
    },
    {
      id: "feel",
      lines: [
        "It’s okay if you feel sad or angry. Every emotion you feel is a part of you. They aren’t signs of weakness. In their own way, they help shape the person you become.",
      ],
    },
    { id: "allowed", lines: ["You’re allowed to be tired.", "You’re allowed to cry.", "You’re allowed to fall, too."] },
    { id: "stop", lines: ["You can stop for a little while."] },
    { id: "again", lines: ["We can start walking again later, slowly."] },
    {
      id: "wounds",
      lines: [
        "Learn to embrace the wounds left behind by people who hurt you, even if they never had the chance to say they were sorry.",
      ],
    },
    { id: "yourself", lines: ["Don’t do it for them.", "Do it for yourself.", "Do it because you deserve peace, too."] },
    {
      id: "plans",
      lines: [
        "Don’t let your plans get in the way of your journey. Enjoy where you are, and give yourself permission to explore.",
      ],
    },
    { id: "find", lines: ["Eventually, little by little, you’ll find what you’ve been looking for."] },
    {
      id: "recap",
      lines: [
        "And when you’ve felt it all and lived through it all, remember that there are three things at the heart of being human:",
      ],
    },
    { id: "three", lines: ["The body, the mind, and the heart."], size: "big" },
    { id: "two", lines: ["Some people might say there are only the body and the mind."] },
    { id: "make", lines: ["But even with just those two, somehow, we can still make…"] },
    { id: "love", lines: ["<3"], size: "huge" },
    { id: "heal", lines: ["I hope you heal from every struggle you keep hidden from the world."] },
    { id: "hears", lines: ["God hears everything you carry in your heart."] },
    { id: "forward", lines: ["Keep moving forward. You’re almost there."] },
    { id: "going", lines: ["Just keep going."], size: "big" },
    { id: "alright", lines: ["Somehow, things will be alright in"] },
    { id: "end", lines: ["the end."], size: "huge" },
  ] satisfies readonly Beat[],
  /** The names under the three shapes, the two times they line up. */
  labels: { mind: "mind", body: "body", heart: "heart" },
  /** For screen readers, in place of the drawing. */
  description:
    "Alongside the words, a drawing: a small traveler made of three shapes, a mind, a body and a heart, walks through the story, from the first look to a sunrise at the end.",
} as const;
