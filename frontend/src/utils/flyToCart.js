export function flyToCart(sourceImg) {
  const cartIcon = document.getElementById("cart-icon");
  if (!sourceImg || !cartIcon) return;

  const startRect = sourceImg.getBoundingClientRect();
  const endRect = cartIcon.getBoundingClientRect();
  if (startRect.width === 0 || startRect.height === 0) return;

  const clone = sourceImg.cloneNode(true);
  clone.className = "fly-to-cart-clone";
  Object.assign(clone.style, {
    top: `${startRect.top}px`,
    left: `${startRect.left}px`,
    width: `${startRect.width}px`,
    height: `${startRect.height}px`,
  });
  document.body.appendChild(clone);

  const dx = endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
  const dy = endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);

  requestAnimationFrame(() => {
    clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.1)`;
    clone.style.opacity = "0.2";
  });

  const cleanup = () => {
    clone.remove();
    cartIcon.classList.add("cart-bump");
    setTimeout(() => cartIcon.classList.remove("cart-bump"), 300);
  };

  clone.addEventListener("transitionend", cleanup, { once: true });
  setTimeout(cleanup, 900);
}
