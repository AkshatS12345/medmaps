// Fire-and-forget signal that an "Add to Cart" button was clicked.
// CartFlyLayer listens for this event and animates a package dropping from
// the clicked button's center into the floating cart button.
export function flyToCart(originEl) {
  const r = originEl.getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent("medmaps:cart-fly", {
      detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
    })
  );
}