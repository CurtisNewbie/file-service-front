import {
  animate,
  AnimationTriggerMetadata,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";

export function animateElementExpanding(): AnimationTriggerMetadata {
  return trigger("detailExpand", [
    state("collapsed", style({ height: "0px", minHeight: "0" })),
    state("expanded", style({ height: "*" })),
    transition(
      "expanded <=> collapsed",
      animate("100ms cubic-bezier(0.4, 0.0, 0.2, 1)")
    ),
  ]);
}
