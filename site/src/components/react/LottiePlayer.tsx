import { useEffect, useRef, useState } from "react";
import { useLottie } from "lottie-react";

/**
 * Lightweight Lottie island. Fetches the animation JSON from /public at
 * runtime (the files are large, so we keep them out of the JS bundle) and
 * respects prefers-reduced-motion by holding on the first frame.
 */
interface Props {
  /** Path under /public, e.g. "/assets/motion/Rex_Thinking_Loop.json" */
  src: string;
  loop?: boolean;
  /** Play once when scrolled into view (good for "job complete"). */
  playOnView?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function LottiePlayer({
  src,
  loop = true,
  playOnView = false,
  className,
  ariaLabel = "TradesBrain animation",
}: Props) {
  const [data, setData] = useState<object | null>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then((r) => r.json())
      .then((j) => alive && setData(j))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [src]);

  if (!data) {
    return <div className={className} aria-hidden="true" />;
  }
  return (
    <Inner
      data={data}
      loop={loop && !reduced}
      autoplay={!reduced && !playOnView}
      playOnView={playOnView && !reduced}
      className={className}
      ariaLabel={ariaLabel}
    />
  );
}

function Inner({
  data,
  loop,
  autoplay,
  playOnView,
  className,
  ariaLabel,
}: {
  data: object;
  loop: boolean;
  autoplay: boolean;
  playOnView: boolean;
  className?: string;
  ariaLabel: string;
}) {
  const { View, play, goToAndStop } = useLottie({
    animationData: data,
    loop,
    autoplay,
    rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
  });
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playOnView || !wrap.current) return;
    goToAndStop(0, true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          play();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(wrap.current);
    return () => io.disconnect();
  }, [playOnView, play, goToAndStop]);

  return (
    <div ref={wrap} className={className} role="img" aria-label={ariaLabel}>
      {View}
    </div>
  );
}
