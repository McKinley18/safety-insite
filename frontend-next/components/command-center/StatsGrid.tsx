/**
 * §281 (D-041) — THE DASHBOARD COUNTERS, WHICH MAY NOT SHOW A NUMBER THEY CANNOT STAND BEHIND.
 *
 * Each tile takes a `DataValue`, not a number. That is the whole design: a caller that did not
 * reach the server cannot pass a zero through this component, because `OFFLINE_UNAVAILABLE`
 * renders an em dash and a caption and has no value to render.
 *
 * The caption is NOT colour alone and NOT an icon alone — it is words, under the figure, for the
 * same reason the HazLenz unresolved state is: an inspector glancing at a board in a plant is not
 * going to decode a tint.
 */
import {
  dataStateCaption,
  dataStateDisplayValue,
  type DataValue,
} from "@/lib/data/dataState";

export type StatTile = {
  key: string;
  label: string;
  /** The short line under the label. Describes what is counted, not its state. */
  description: string;
  value: DataValue<number>;
};

export function StatsGrid({ tiles }: { tiles: StatTile[] }) {
  return (
    <div
      data-testid="dashboard-stats"
      className="mx-auto grid w-full max-w-[360px] grid-cols-2 gap-2.5 lg:mx-0 lg:max-w-[390px]"
    >
      {tiles.map((tile) => {
        const caption = dataStateCaption(tile.value);
        const unavailable = tile.value.state === "OFFLINE_UNAVAILABLE";
        return (
          <div
            key={tile.key}
            /* §285 (D-044). Addressable, so a gate reads the tile it names rather than inferring
               which one it found from the shape of the DOM around it. */
            data-testid="stat-tile"
            data-tile-key={tile.key}
            data-tile-state={tile.value.state}
            className="rounded-xl border border-white/12 bg-white/10 px-3 py-3 text-center shadow-none backdrop-blur"
          >
            <p
              className={[
                "text-center text-2xl font-black tracking-[-0.06em] sm:text-3xl",
                // A dash is not a quieter number, it is the absence of one, so it is not given the
                // same weight as a figure the product is standing behind.
                unavailable ? "text-blue-100/70" : "text-white",
              ].join(" ")}
            >
              {dataStateDisplayValue(tile.value)}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">
              {tile.label}
            </p>
            {/*
              The state caption. Present only when there IS something to say: a CURRENT value
              returns null, because captioning every number with "Current" is exactly how a caption
              stops being read, and then the one that matters is invisible too.

              `role="status"` so a screen-reader user is told that the figure beside it is stale or
              missing. Without it the dash is announced as a dash and the reason never arrives.
            */}
            {caption && (
              <p
                role="status"
                className="mt-1 text-[9px] font-bold leading-tight tracking-wide text-blue-100/90"
              >
                {caption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
