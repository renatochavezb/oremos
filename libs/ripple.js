export function createRipple(e, element, color = "rgba(107, 85, 132, 0.4)") {
  if (typeof window === "undefined" || !element) return;
  
  const rect = element.getBoundingClientRect();
  const ripple = document.createElement("div");
  
  // Get click coordinates relative to viewport
  const clientX = e.clientX ?? (rect.left + rect.width / 2);
  const clientY = e.clientY ?? (rect.top + rect.height / 2);
  
  ripple.style.position = "fixed";
  ripple.style.top = `${clientY}px`;
  ripple.style.left = `${clientX}px`;
  ripple.style.width = "10px";
  ripple.style.height = "10px";
  ripple.style.background = color;
  ripple.style.borderRadius = "50%";
  ripple.style.pointerEvents = "none";
  ripple.style.zIndex = "9999";
  ripple.style.transform = "translate(-50%, -50%)";
  document.body.appendChild(ripple);

  const anim = ripple.animate(
    [
      { width: "0px", height: "0px", opacity: 1 },
      { width: "1000px", height: "1000px", opacity: 0 },
    ],
    {
      duration: 1200,
      easing: "ease-out",
    }
  );

  anim.onfinish = () => ripple.remove();
}
