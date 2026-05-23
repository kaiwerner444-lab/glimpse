// Demo-mode toggle for the Tier 3 acute emergency banner. Lets product
// reviewers see the 911 flow without needing a real session pattern to
// fire it. Set via Settings, stored in localStorage.

const KEY = "glimpse.demo-emergency";

export function isDemoEmergency(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "true";
}

export function setDemoEmergency(on: boolean): void {
  if (typeof window === "undefined") return;
  if (on) {
    window.localStorage.setItem(KEY, "true");
  } else {
    window.localStorage.removeItem(KEY);
  }
}
