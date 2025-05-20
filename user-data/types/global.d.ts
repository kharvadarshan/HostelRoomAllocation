declare global {
  var mongoose: {
    conn: import('mongoose') | null;
    promise: Promise<import('mongoose')> | null;
  };
}

export {};