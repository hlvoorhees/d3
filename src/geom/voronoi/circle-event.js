function d3_geom_voronoiCircleEvent() {
  this.arc = null;
  this.site = null;
  this[0] = null;
  this[1] = null;
  this.ycenter = null;
}

function d3_geom_voronoiAttachCircleEvent(arc) {
  var lArc = arc.rbPrevious,
      rArc = arc.rbNext;

  if (!lArc || !rArc) return;

  var lSite = lArc.site,
      cSite = arc.site,
      rSite = rArc.site;

  if (lSite === rSite) return;

  var bx = cSite[0],
      by = cSite[1],
      ax = lSite[0] - bx,
      ay = lSite[1] - by,
      cx = rSite[0] - bx,
      cy = rSite[1] - by;

  var d = 2 * (ax * cy - ay * cx);
  if (d >= -ε2) return;

  var ha = ax * ax + ay * ay,
      hc = cx * cx + cy * cy,
      x = (cy * ha - ay * hc) / d,
      y = (ax * hc - cx * ha) / d,
      ycenter = y + by;

  var circleEvent = d3_geom_voronoiCircleEventJunkyard.pop();
  if (!circleEvent) circleEvent = new d3_geom_voronoiCircleEvent;
  circleEvent.arc = arc;
  circleEvent.site = cSite;
  circleEvent[0] = x + bx;
  circleEvent[1] = ycenter + Math.sqrt(x * x + y * y); // y bottom
  circleEvent.ycenter = ycenter;

  arc.circleEvent = circleEvent;

  var predecessor = null,
      node = d3_geom_voronoiCircleEvents.root;

  while (node) {
    if (circleEvent[1] < node[1] || (circleEvent[1] === node[1] && circleEvent[0] <= node[0])) {
      if (node.rbLeft) node = node.rbLeft;
      else { predecessor = node.rbPrevious; break; }
    } else {
      if (node.rbRight) node = node.rbRight;
      else { predecessor = node; break; }
    }
  }

  d3_geom_voronoiCircleEvents.rbInsert(predecessor, circleEvent);
  if (!predecessor) d3_geom_voronoiFirstCircleEvent = circleEvent;
}

function d3_geom_voronoiDetachCircleEvent(arc) {
  var circle = arc.circleEvent;
  if (circle) {
    if (!circle.rbPrevious) d3_geom_voronoiFirstCircleEvent = circle.rbNext;
    d3_geom_voronoiCircleEvents.rbRemove(circle);
    d3_geom_voronoiCircleEventJunkyard.push(circle);
    arc.circleEvent = null;
  }
}