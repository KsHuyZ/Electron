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