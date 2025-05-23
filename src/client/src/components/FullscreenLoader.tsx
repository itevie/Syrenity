import { useMemo } from "react";
import { fallbackImage } from "../config";
import Column from "../dawn-ui/components/Column";
import Icon from "../dawn-ui/components/Icon";
import Words, { TextType } from "../dawn-ui/components/Words";

// Most of these were made by chatgpt
const phrases: string[] = [
  "Now loading...",
  "Now playing: Loading Simulator 2025",
  "Syrenity is cool. Syrenity is awesome.",
  "Chatting with the loading gods...",
  "Chatting with the loading goddesses...",
  "Your messaages are on their way. Slowly.",
  "Hold tight, the chat magic is happening!",
  "The chat is loading, but the fun is loading faster!",
  "We're in the middle of some intense chat loading action.",
  "Loading... Imagine a progress bar with sunglasses.",
  "You've got mail… well, soon you will.",
  "Almost there! It's like waiting for a pizza delivery.",
  "Your messages are coming in hot… but not too hot, we're cooling them down.",
  "Chat is coming, but first… coffee.",
  "We promise it's worth the wait… or at least that's what we tell ourselves.",
  "Loading… it's a marathon, not a sprint.",
  "We're on it, like a cat chasing a laser pointer.",
  "Almost there, just putting the final touches on your digital masterpiece.",
  "Still loading… Please enjoy the art of waiting.",
  "Hang tight, your chat's getting its groove on.",
  "This is what happens when you ask your computer for a hug.",
  "The loading bar is on a coffee break, back soon.",
  "We're busy turning pixels into conversations.",
  "Your messages are loading, faster than a slow cooker on low.",
  "It's not you, it's us. We're loading all your messages right now.",
  "Hold tight! We're assembling the world's greatest conversation.",
  "Our servers are stretching their legs. Please hold.",
  "These messages were generated by ChatGPT, how lazy is that?",
];

export default function FullscreenLoader() {
  const phrase = useMemo(() => {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, []);

  return (
    <div className="dawn-fullscreen dawn-fullscreen-loading">
      <div className="dawn-page-center">
        <Column util={["justify-center", "align-center"]}>
          <Icon className="dawn-spin" src={fallbackImage} size={"256px"} />
          <Words type={TextType.Heading}>{phrase}</Words>
        </Column>
      </div>
    </div>
  );
}
