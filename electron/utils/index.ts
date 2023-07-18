import db from "./connectDB";

export const runQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

export const runQueryGetAllData = (query, params) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, function (err, rows) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const runQueryGetData = (query, params) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, function (err, row) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const runQueryReturnID = function (query, params) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

export const dateStringReverse = (originalDate: string, isFull: boolean = false, position?: number): string => {
  const [year, month, day] = originalDate.split("/");

  if (isFull && position !== undefined) {
    return originalDate.split("/")[position];
  }

  return `${day}/${month}/${year}`;
};


