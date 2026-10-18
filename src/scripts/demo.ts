export function initDemo(): void {
  const video = document.querySelector<HTMLVideoElement>('.demo-video');
  if (!video || !matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  video.autoplay = false;
  video.pause();
  video.controls = true;
}
