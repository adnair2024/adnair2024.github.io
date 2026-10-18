export function initDemo(): void {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll<HTMLVideoElement>('.demo-video').forEach((video) => {
    video.autoplay = false;
    video.pause();
    video.controls = true;
  });
}
