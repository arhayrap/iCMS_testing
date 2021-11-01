const fs = require("fs");

module.exports = (on, config) => {
  on('task', {
    writeFile({ path, data }) {
      // console.log("Attention ", data["results"][""]);
      // let stop = true;
      let refreshIntervalId = setInterval(() => {'pass'}, 10000);
      try{
        fs.writeFile(path, JSON.stringify(data, null, 2));
      } finally {
        clearInterval(refreshIntervalId);
      }
      return null;
    },
  })
}