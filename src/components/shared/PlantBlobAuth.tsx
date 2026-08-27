export default function PlantBlobAuth() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="blobShape" clipPathUnits="objectBoundingBox">
          <path d="M0,0 H0.6 C0.78,0.04 0.68,0.22 0.82,0.32 C0.97,0.43 0.86,0.58 0.76,0.68 C0.66,0.78 0.82,0.9 0.6,1 H0 Z" />
        </clipPath>
      </defs>

      <rect width="100" height="100" fill="rgb(var(--color-green))" />

      <g clipPath="url(#blobShape)">
        <rect width="100" height="100" fill="rgb(var(--color-background))" />

        {/* simple growing sprout, centered in the visible blob area */}
        <g transform="translate(28, 48)">
          <path
            d="M0,40 C0,20 0,10 0,0"
            stroke="rgb(var(--color-green))"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0,18 C-10,14 -14,4 -12,-4 C-3,-4 2,6 0,18 Z"
            fill="rgb(var(--color-green))"
          />
          <path
            d="M0,10 C10,6 14,-4 12,-12 C3,-12 -2,-2 0,10 Z"
            fill="rgb(var(--color-heading))"
          />
          <circle cx="0" cy="-2" r="3.5" fill="rgb(var(--color-heading))" />
        </g>
      </g>
    </svg>
  );
}