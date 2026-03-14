export function createDefaultSrs() {
  return {
    repetitions: 0,
    interval: 1,
    ease: 2.5,
    lastReviewed: null,
    nextReview: new Date().toISOString(),
  };
}

export function isDue(item) {
  const nextReview = item?.srs?.nextReview;
  return new Date(nextReview).getTime() <= Date.now();
}

export function applySrsReview(item, quality) {
  const next = {
    ...item,
    srs: {
      repetitions: item.srs?.repetitions || 0,
      interval: item.srs?.interval || 1,
      ease: item.srs?.ease || 2.5,
      lastReviewed: item.srs?.lastReviewed || null,
      nextReview: item.srs?.nextReview || new Date().toISOString(),
    },
  };

  next.srs.ease = Math.max(
    1.3,
    next.srs.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  if (quality < 3) {
    next.srs.repetitions = 0;
    next.srs.interval = 1;
  } else {
    next.srs.repetitions += 1;
    if (next.srs.repetitions === 1) {
      next.srs.interval = 1;
    } else if (next.srs.repetitions === 2) {
      next.srs.interval = 3;
    } else {
      next.srs.interval = Math.max(1, Math.round(next.srs.interval * next.srs.ease));
    }
  }

  next.srs.lastReviewed = new Date().toISOString();
  next.srs.nextReview = new Date(Date.now() + next.srs.interval * 86400000).toISOString();

  return next;
}
