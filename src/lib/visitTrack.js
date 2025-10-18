export function visitTrack() {
  const latestVisit = localStorage.getItem('latestVisit');
  if (!latestVisit) {
    localStorage.setItem('latestVisit', new Date().toISOString());
    return false;
  } else {
    const lastVisitDate = new Date(latestVisit);
    const now = new Date();
    const diffHours = Math.abs(now - lastVisitDate) / 36e5;
    if (diffHours > 4) {
      localStorage.setItem('latestVisit', new Date().toISOString());
      return true;
    }
  }
}
